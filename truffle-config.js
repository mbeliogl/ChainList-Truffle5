const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
      
        ganache: {
          host: "127.0.0.1",
          port: 7545,
          network_id: "*"
        },
        
        develop: { 
          host: "127.0.0.1", 
          port: 7545, 
          network_id: '*' 
        },

        chainskills: {
          host: "127.0.0.1", 
          port: 8545, 
          network_id: '4224',
          gas: 4700000
        },
        
        goerli: {
          provider: function () {
              return new HDWalletProvider(process.env.MNEMONIC, "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY);
          },
          network_id: 3,
          gas: 4500000,
          gasPrice: 10000000000
       }
    },

    //improving compiler performance 
    compilers: {
      solc: {
        settings: {
          optimizer: {
            enabled: true, 
            runs: 200
          }
        }
      }
    }

  };
  