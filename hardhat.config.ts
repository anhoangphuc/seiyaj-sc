import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    goerli: {
      accounts: [process.env.PRIVATE_KEY || ''],
      url: 'https://goerli.blockpi.network/v1/rpc/public',
      chainId: 5,
    },
    sepolia: {
      accounts: [process.env.PRIVATE_KEY || ''],
      url: 'https://rpc-sepolia.rockx.com	',
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || '',
  }
};

export default config;
