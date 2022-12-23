const ChainList = artifacts.require("./ChainList.sol");

//test suite entry point 
contract ('ChainList', function(accounts){

    let chainListInstance; 
    const seller = accounts[0];
    const buyer = accounts[1];

    const articleName1 = "Article 1";
    const articleDescription1 = "Description for article 1";
    const articlePrice1 = web3.utils.toBN(10);

    const articleName2 = "Article 2";
    const articleDescription2 = "Description for article 2";
    const articlePrice2 = web3.utils.toBN(5); 

    let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    let buyerBalanceBeforeBuy,buyerBalanceAfterBuy; 

    before("set up contract instance for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

    //testing the constructor/getArticle as it creates initial state  
    it('is initialized with empty values', async () => {
        const numOfArticles = await chainListInstance.getNumOfArticles();
        assert.equal(numOfArticles, 0, "Number of articles must be 0");

        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 0, "articles for sale should be empty");

    });

    //testing sellArticle() - testing first article only and verifying it has ID and is stored in mapping
    //setting data using sellArticle then checking data was set appropriately using getArticle()
    it("should let us sell a first article", async () => {

        const receipt = await chainListInstance.sellArticle(articleName1, articleDescription1, web3.utils.toWei(articlePrice1, "ether"), {from: seller});

        // checking correct event was event
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "event article price must be " + web3.utils.toWei(articlePrice1, "ether"));
            
        //verifying contract state changed - number of articles
        const numOfArticles = await chainListInstance.getNumOfArticles();
        assert.equal(numOfArticles, 1, "number of articles must be one");
    
        //verifying contract state changed - number of articles & ID
        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 1, "there must be one article for sale");
        const articleId = articlesForSale[0].toNumber();
        assert.equal(articleId, 1, "article id must be 1");

        //verifying contract state changed - article data 
        const article = await chainListInstance.articles(articleId);
        assert.equal(article[5].toNumber(), 1, "article id must be 1");
        assert.equal(article[0], seller, "seller must be " + seller);
        assert.equal(article[1], 0x0, "buyer must be empty");
        assert.equal(article[2], articleName1, "article name must be " + articleName1);
        assert.equal(article[3], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(article[4].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));
    });

    //testing sell of a second article 
    it('should sell the second article', async () => {
        
        const receipt = await chainListInstance.sellArticle(articleName2, articleDescription2, web3.utils.toWei(articlePrice2, "ether"), {from: seller});

        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "right event was triggered");
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "article id must be 2");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller is" + " " + seller);
        assert.equal(receipt.logs[0].args._name, articleName2, "article name is " + articleName2);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice2, "ether").toString(), "event article price is" + " " + web3.utils.toWei(articlePrice2, "ether"));

        //verifying contract state changed - number of articles
        const numOfArticles = await chainListInstance.getNumOfArticles();
        assert.equal(numOfArticles, 2, "number of articles must be two");
    
        //verifying contract state changed - number of articles & ID
        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 2, "there must be two articles for sale");
        const articleId = articlesForSale[1].toNumber();
        assert.equal(articleId, 2, "article id must be 2");

        //verifying contract state changed - article data 
        const article = await chainListInstance.articles(articleId);
        assert.equal(article[5].toNumber(), 2, "article id must be 2");
        assert.equal(article[0], seller, "seller must be " + seller);
        assert.equal(article[1], 0x0, "buyer must be empty");
        assert.equal(article[2], articleName2, "article name must be " + articleName2);
        assert.equal(article[3], articleDescription2, "article description must be " + articleDescription2);
        assert.equal(article[4].toString(), web3.utils.toWei(articlePrice2, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice2, "ether"));
    });

    //buyArticle() & test case adapted to take the article identifier 
    it('should buy an article', async () => {
        const articleId = 1;

        //keeping track of balances of seller and buyer *before* the buy 
        sellerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
        buyerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));

        const receipt = await chainListInstance.buyArticle(articleId, {from: buyer, value: web3.utils.toWei(articlePrice1, "ether")});
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogBuyArticle", "right event was triggered");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Article ID must be 1");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller is" + " " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "event seller is" + " " + buyer);
        assert.equal(receipt.logs[0].args._name, articleName1, "article name is" + " " + articleName1);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "event article price is" + " " + web3.utils.toWei(articlePrice1, "ether"));

        //track balances of seller and buyer *after* the buy 
        sellerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
        buyerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));

        //check balances of seller and buyer *after* the buy (accounting for gas)
        assert(sellerBalanceAfterBuy == (sellerBalanceBeforeBuy + articlePrice1.toNumber()), "seller should have earned " + articlePrice1 + " ETH");
        assert(buyerBalanceAfterBuy <= (buyerBalanceBeforeBuy - articlePrice1.toNumber()), "buyer should have spent " + articlePrice1 + " ETH" + " Gas Fee");

        const article = await chainListInstance.articles(articleId);
        
        assert.equal(article[5].toNumber(), 1, "article id must be 1");
        assert.equal(article[0], seller, "seller must be " + seller);
        assert.equal(article[1], buyer, "buyer must be " + buyer);
        assert.equal(article[2], articleName1, "article name must be " + articleName1);
        assert.equal(article[3], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(article[4].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));

        const articlesForSale = await chainListInstance.getArticlesForSale();
        
        assert(articlesForSale.length, 1, "there should now be only one article left for sale");
    });

});