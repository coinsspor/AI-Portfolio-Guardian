import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const POLYGON = process.env.POLYGON_MAINNET_RPC || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true, // <-- stack too deep'e net çözüm
    },
  },
  networks: {
    polygon: {
      url: POLYGON,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
export default config;
