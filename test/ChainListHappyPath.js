var ChainList = artifacts.require("./ChainList.sol");

//test suite entry point 
contract ('ChainList', function(accounts){

    var ChainListInstance; 
    var seller = accounts[0];
    var buyer = accounts[1];

    var articleName1 = "Article 1";
    var articleDescription1 = "Description for article 1";
    var articlePrice1 = 10;

    var articleName2 = "Article 2";
    var articleDescription2 = "Description for article 2";
    var articlePrice2 = 5; 

    var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    var buyerBalanceBeforeBuy,buyerBalanceAfterBuy; 


    //testing the constructor/getArticle as it creates initial state  
    it('is initialized with empty values', function(){
        return ChainList.deployed().then(function(instance){
            ChainListInstance = instance; 
            return instance.getNumOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 0, "Number of articles must be 0");
            return ChainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 0, "There should not be any articles for sale");
        })
    })



    //testing sellArticle() - testing first article only and verifying it has ID and is stored in mapping
    //setting data using sellArticle then checking data was set appropriately using getArticle()
    it("should let us sell a first article", function() {
        return ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          return chainListInstance.sellArticle(
            articleName1,
            articleDescription1,
            web3.toWei(articlePrice1, "ether"),
            {from: seller}
          );
        }).then(function(receipt){
          // checking correct event was event
          assert.equal(receipt.logs.length, 1, "one event should have been triggered");
          assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
          assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
          assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
          assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
          assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));
            
          return chainListInstance.getNumOfArticles();
        }).then(function(data) { //verifying contract state changed
          assert.equal(data, 1, "number of articles must be one");
    
          return chainListInstance.getArticlesForSale();
        }).then(function(data) { //verifying contract state changed
          assert.equal(data.length, 1, "there must be one article for sale");
          assert.equal(data[0].toNumber(), 1, "article id must be 1");
    
          return chainListInstance.articles(data[0]);
        }).then(function(data) { //verifying metadata of article after its put for sale 
          assert.equal(data[5].toNumber(), 1, "article id must be 1");
          assert.equal(data[0], seller, "seller must be " + seller);
          assert.equal(data[1], 0x0, "buyer must be empty");
          assert.equal(data[2], articleName1, "article name must be " + articleName1);
          assert.equal(data[3], articleDescription1, "article description must be " + articleDescription1);
          assert.equal(data[4].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
        });
    });

    //testing sell of a second article 
    it('should sell the second article', function(){
        return ChainList.deployed().then(function(instance){
            ChainListInstance = instance; 
            return ChainListInstance.sellArticle(
                articleName2, 
                articleDescription2,
                web3.toWei(articlePrice2,"ether"),
                {from: seller}
            );
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, "LogSellArticle", "right event was triggered");
            assert.equal(receipt.logs[0].args._id.toNumber(), 2, "Id of first article must be 1");
            assert.equal(receipt.logs[0].args._seller, seller, "event seller is" + " " + seller);
            assert.equal(receipt.logs[0].args._name, articleName2, "article name is" + " " + articleName2);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price is" + " " + web3.toWei(articlePrice2, "ether"));

            //verifying state of contract was altered 
            return ChainListInstance.getNumOfArticles();
        }).then(function(data){
            assert.equal(data, 2, "Number of articles must be 2");

            return ChainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 2, "There must be 2 article for sale");
            assert.equal(data[1].toNumber(), 2, "Article ID must be 2");

            return ChainListInstance.articles(data[1]);
        }).then(function(data){ //verifying metadata of article using the App.articles() function
            assert.equal(data[5].toNumber(), 2, "Article ID must be 2");
            assert.equal(data[0], seller, "Seller must be " + seller);
            assert.equal(data[1], 0x0, "Buyer must be empty");
            assert.equal(data[2], articleName2, "Article name must be " + articleName2);
            assert.equal(data[3], articleDescription2, "Article Description must be " + articleDescription2);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice2, "ether"), "Article price must be" + web3.toWei(articlePrice2, "ether"));

        })
    })

    //buyArticle() & test case adapted to take the article identifier 
    it('should buy an article', function(){
        return ChainList.deployed().then(function(instance){
            ChainListInstance = instance;
            //keeping track of balances of seller and buyer *before* the buy 
            sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

            return ChainListInstance.buyArticle( 
                1, 
                {from: buyer, 
                value: web3.toWei(articlePrice1, "ether")
            }).then(function(receipt){
                assert.equal(receipt.logs.length, 1, "one event should have been triggered");
                assert.equal(receipt.logs[0].event, "LogBuyArticle", "right event was triggered");
                assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Article ID must be 1");
                assert.equal(receipt.logs[0].args._seller, seller, "event seller is" + " " + seller);
                assert.equal(receipt.logs[0].args._buyer, buyer, "event seller is" + " " + buyer);
                assert.equal(receipt.logs[0].args._name, articleName1, "article name is" + " " + articleName1);
                assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price is" + " " + web3.toWei(articlePrice1, "ether"));

                //track balances of seller and buyer *after* the buy 
                sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
                buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

                //check balances of seller and buyer *after* the buy (accounting for gas)
                assert(sellerBalanceAfterBuy == (sellerBalanceBeforeBuy + articlePrice1), "seller should have earned " + articlePrice1 + " ETH");
                assert(buyerBalanceAfterBuy <= (buyerBalanceBeforeBuy - articlePrice1), "buyer should have spent " + articlePrice1 + " ETH" + " Gas Fee");

                return ChainListInstance.getArticlesForSale();

            }).then(function(data){
                assert.equal(data.length, 1, "There shoud now only be 1 article left for sale");
                assert.equal(data[0].toNumber(), 2, "Article 2 must be the only article left for sale");

                return ChainListInstance.getNumOfArticles();
            }).then(function(data){
                assert.equal(data.toNumber(), 2, "There must still be 2 articles in total")
            })
        })
    })


})