// truffle-config.js

// Uncomment the lines below and set up dotenv if deploying via Infura or using sensitive data securely
// require('dotenv').config();
// const { MNEMONIC, PROJECT_ID } = process.env;
// const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    // Local development network (default for Ganache GUI)
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777", // Match any network id
      gas: 6721975,
      gasPrice: 20000000000,
    },

    // Explicit Ganache CLI or GUI network definition
    // ganache: {
    //   host: "127.0.0.1",
    //   port: 7545,
    //   network_id: 5777, // Standard Ganache network ID
    //   gas: 6721975,
    //   gasPrice: 20000000000,
    // },

    // Example for deploying to Goerli testnet via Infura
    // goerli: {
    //   provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${PROJECT_ID}`),
    //   network_id: 5,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true,
    // },

    // Private network example
    // private: {
    //   provider: () => new HDWalletProvider(MNEMONIC, "https://network.io"),
    //   network_id: 2111,
    //   production: true,
    // },
  },

  // Mocha test framework configuration
  mocha: {
    timeout: 100000,
  },

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "byzantium",
      },
    },
  },

  // Truffle DB is disabled by default
  // db: {
  //   enabled: false,
  //   host: "127.0.0.1",
  //   adapter: {
  //     name: "indexeddb",
  //     settings: {
  //       directory: ".db"
  //     }
  //   }
  // }
};
