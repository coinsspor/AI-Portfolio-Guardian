// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/// @title RiskRegistryV3 — AI risk attestation (Polygon Mainnet)
/// @notice Stores risk score + feature vector per wallet & model. Supports EIP-712 signed writes and public demo mode.
contract RiskRegistry is Ownable, Pausable, EIP712 {
    using ECDSA for bytes32;

    struct Features { uint16 concentration; uint16 stable; uint16 activity; }
    struct Record {
        uint16 score;       // 0-100
        uint16 confidence;  // 0-100
        uint16 version;     // model version
        uint64 updatedAt;   // unix sec
        address attestor;   // who wrote it
        bytes32 modelId;    // model id
        Features f;         // feature vector
        string tag;         // free text (e.g. "risk.v1:timestamp")
    }

    // Internal helper to avoid stack-too-deep
    struct WriteData {
        address wallet; bytes32 modelId; uint16 version; uint16 score;
        uint16 confidence; uint16 concentration; uint16 stable; uint16 activity;
        string tag; address attestor;
    }

    // wallet => modelId => record
    mapping(address => mapping(bytes32 => Record)) private _records;

    // per wallet + model nonce (for EIP-712)
    mapping(address => mapping(bytes32 => uint256)) public nonces;

    // attestor allowlist (for restricted direct writes)
    mapping(address => bool) public isAttestor;

    // EIP-712 trusted signer (backend)
    address public signer;

    // Optional fee in POL
    uint256 public feeWei;
    address public feeRecipient;

    // Public demo mode switch
    bool public publicMode;

    // Model metadata (optional)
    mapping(bytes32 => string) public modelURI;

    // --- Events ---
    event RiskAttested(
        address indexed wallet,
        bytes32 indexed modelId,
        uint16 version,
        uint16 score,
        uint16 confidence,
        uint16 concentration,
        uint16 stable,
        uint16 activity,
        address attestor,
        string tag
    );

    event RiskCleared(address indexed wallet, bytes32 indexed modelId, address indexed by);
    event SignerChanged(address indexed oldSigner, address indexed newSigner);
    event AttestorSet(address indexed attestor, bool allowed);
    event FeeChanged(uint256 feeWei, address indexed recipient);
    event PublicModeSet(bool enabled);
    event ModelUpdated(bytes32 indexed modelId, string uri);

    // EIP-712 typehash for signed writes
    bytes32 private constant ATTEST_TYPEHASH =
        keccak256(
            "Attest(address wallet,bytes32 modelId,uint16 version,uint16 score,uint16 confidence,uint16 concentration,uint16 stable,uint16 activity,string tag,uint256 nonce,uint256 deadline)"
        );

    constructor(address _owner, address _feeRecipient)
        Ownable(_owner)
        EIP712("APG-RiskRegistry","3")
    {
        feeRecipient = _feeRecipient;
        publicMode = false;
    }

    // --- Admin ---
    function setSigner(address s) external onlyOwner {
        emit SignerChanged(signer, s);
        signer = s;
    }

    function setAttestor(address a, bool v) external onlyOwner {
        isAttestor[a] = v;
        emit AttestorSet(a, v);
    }

    function setFee(uint256 fee, address recipient) external onlyOwner {
        feeWei = fee;
        feeRecipient = recipient;
        emit FeeChanged(fee, recipient);
    }

    function setPublicMode(bool v) external onlyOwner {
        publicMode = v;
        emit PublicModeSet(v);
    }

    function setModelURI(bytes32 modelId, string calldata uri) external onlyOwner {
        modelURI[modelId] = uri;
        emit ModelUpdated(modelId, uri);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // --- Public demo: anyone can write when publicMode = true ---
    function attestOpen(
        address wallet,
        bytes32 modelId,
        uint16 version,
        uint16 score,
        uint16 confidence,
        uint16 concentration,
        uint16 stable,
        uint16 activity,
        string calldata tag
    ) external payable whenNotPaused {
        require(publicMode, "public off");
        _takeFee();
        _write(WriteData({
            wallet: wallet, modelId: modelId, version: version, score: score, confidence: confidence,
            concentration: concentration, stable: stable, activity: activity, tag: tag, attestor: msg.sender
        }));
    }

    // --- Restricted direct write (allowlisted attestors) ---
    function attest(
        address wallet,
        bytes32 modelId,
        uint16 version,
        uint16 score,
        uint16 confidence,
        uint16 concentration,
        uint16 stable,
        uint16 activity,
        string calldata tag
    ) external payable whenNotPaused {
        require(isAttestor[msg.sender], "not attestor");
        _takeFee();
        _write(WriteData({
            wallet: wallet, modelId: modelId, version: version, score: score, confidence: confidence,
            concentration: concentration, stable: stable, activity: activity, tag: tag, attestor: msg.sender
        }));
    }

    // --- EIP-712 signed write by backend signer ---
    function attestSigned(
        address wallet,
        bytes32 modelId,
        uint16 version,
        uint16 score,
        uint16 confidence,
        uint16 concentration,
        uint16 stable,
        uint16 activity,
        string calldata tag,
        uint256 deadline,
        bytes calldata signature
    ) external payable whenNotPaused {
        require(signer != address(0), "signer=0");
        require(block.timestamp <= deadline, "expired");

        _takeFee();

        uint256 nonce = nonces[wallet][modelId]++;
        bytes32 structHash = keccak256(
            abi.encode(
                ATTEST_TYPEHASH,
                wallet,
                modelId,
                version,
                score,
                confidence,
                concentration,
                stable,
                activity,
                keccak256(bytes(tag)),
                nonce,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == signer, "bad sig");

        _write(WriteData({
            wallet: wallet, modelId: modelId, version: version, score: score, confidence: confidence,
            concentration: concentration, stable: stable, activity: activity, tag: tag, attestor: recovered
        }));
    }

    // --- Views ---
    function get(address wallet, bytes32 modelId) external view returns (Record memory) {
        return _records[wallet][modelId];
    }

    function getMany(address wallet, bytes32[] calldata modelIds) external view returns (Record[] memory out) {
        out = new Record[](modelIds.length);
        for (uint256 i=0; i<modelIds.length; i++) {
            out[i] = _records[wallet][modelIds[i]];
        }
    }

    function nonceOf(address wallet, bytes32 modelId) external view returns (uint256) {
        return nonces[wallet][modelId];
    }

    // allow wallet (or owner) to clear its record
    function clear(address wallet, bytes32 modelId) external whenNotPaused {
        require(msg.sender == wallet || msg.sender == owner(), "forbidden");
        delete _records[wallet][modelId];
        emit RiskCleared(wallet, modelId, msg.sender);
    }

    // --- internals ---
    function _takeFee() internal {
        if (feeWei > 0) {
            require(msg.value >= feeWei, "fee");
            (bool ok, ) = (feeRecipient == address(0) ? owner() : feeRecipient).call{value: feeWei}("");
            require(ok, "fee xfer");
            uint256 excess = msg.value - feeWei;
            if (excess > 0) {
                (ok, ) = msg.sender.call{value: excess}("");
                require(ok, "refund");
            }
        } else {
            require(msg.value == 0, "no fee");
        }
    }

    function _write(WriteData memory d) internal {
        require(d.wallet != address(0), "wallet=0");
        require(d.score <= 100 && d.confidence <= 100, "range");
        require(d.concentration <= 100 && d.stable <= 100 && d.activity <= 100, "range");

        _records[d.wallet][d.modelId] = Record({
            score: d.score,
            confidence: d.confidence,
            version: d.version,
            updatedAt: uint64(block.timestamp),
            attestor: d.attestor,
            modelId: d.modelId,
            f: Features({concentration: d.concentration, stable: d.stable, activity: d.activity}),
            tag: d.tag
        });

        emit RiskAttested(
            d.wallet, d.modelId, d.version, d.score, d.confidence,
            d.concentration, d.stable, d.activity, d.attestor, d.tag
        );
    }

    receive() external payable {}
}
