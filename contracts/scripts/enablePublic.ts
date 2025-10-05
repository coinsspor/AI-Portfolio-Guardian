import { ethers } from "hardhat";

const REG = "0x35d818492803865b20804C8D60a149519B215b37";

async function main() {
  const abi = [
    "function setPublicMode(bool v) external",
    "function setFee(uint256 feeWei, address recipient) external",
    "function publicMode() view returns (bool)",
    "function feeWei() view returns (uint256)"
  ];

  const [signer] = await ethers.getSigners();
  console.log("Using signer:", await signer.getAddress());

  const c = new ethers.Contract(REG, abi, signer);

  // Public mode ON ve fee=0
  const tx1 = await c.setPublicMode(true);
  await tx1.wait();
  const tx2 = await c.setFee(0, ethers.ZeroAddress);
  await tx2.wait();

  console.log("publicMode:", await c.publicMode());
  console.log("feeWei:", (await c.feeWei()).toString());
}

main().catch((e) => { console.error(e); process.exit(1); });
