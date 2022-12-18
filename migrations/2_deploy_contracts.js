//deploy contract to node via truffle 

var ChainList = artifacts.require("./ChainList.sol");

module.exports = function(deployer){
    deployer.deploy(ChainList);
}
