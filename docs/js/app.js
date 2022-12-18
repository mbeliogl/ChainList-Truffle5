

App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     init: function() {
      //loading ArticlesRow
      
          return App.initWeb3();
     },

     initWeb3: function() {
      //initializing web3 
      if(typeof web3 !== 'undefined') {
            //reusing provider of the web3 object injected by metamask
            App.web3Provider = web3.currentProvider;
      } else{
            //create new provider and plug it directly into local node 
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }

      web3 = new Web3(App.web3Provider);

      App.displayAccountInfo();

      return App.initContract();
     },

     displayAccountInfo: function (){
      web3.eth.getCoinbase(function(err, account){
            if(err === null) {
                  App.account = account;
                  $('#account').text(account);
                  web3.eth.getBalance(account, function(err, balance){ //async -> receiving in callback func 
                        if(err === null){
                              $('#accountBalance').text(web3.fromWei(balance, "ether") + " " + "ETH")
                        }
                  })
            }
      });
      },

     initContract: function() {
      $.getJSON('ChainList.json', function(chainListArtifact){
            //getting contract artifact file. Use it to instantiate a truffle contract 
            App.contracts.ChainList = TruffleContract(chainListArtifact);

            //setting provider for the contract instance 
            App.contracts.ChainList.setProvider(App.web3Provider); 

            //listening to events 
            App.listenToEvents();

            //retrieving article from contract 
            return App.reloadArticles(); 
      })
     },


     //prepares article for display in the div
     displayArticle: function(seller, name, description, price, id){
      var articlesRow = $('#articlesRow');

      var etherPrice = web3.fromWei(price, "ether");
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherPrice + "ETH");
      articleTemplate.find('.btn-buy').attr('data-id', id);
      articleTemplate.find('.btn-buy').attr('data-value', etherPrice); //adding metadata to buy btn 

      //checking & showing/hiding seller 
      if(seller == App.account){
            articleTemplate.find('.article-seller').text("You");
            articleTemplate.find('.btn-buy').hide();
      } else {
            articleTemplate.find('.article-seller').text(seller);
            articleTemplate.find('.btn-buy').show();
      }


      //adding the article (articleTemplate) to the list of articles to display (articlesRow)
      articlesRow.append(articleTemplate.html())
      


     },


      //loding articles from the contract by id 
      //use ID to load article details 
     reloadArticles: function(){

      //avoid re-entry to the function 
      if(App.loading){
            return;
      }
      App.loading = true; 

          //refreshing account info b/c the balance might have changed 
          App.displayAccountInfo();

          var chainListInstance; 
    
          // retrieving the article placeholder and clear it
      
          App.contracts.ChainList.deployed().then(function(instance) {
            chainListInstance = instance; 
            return chainListInstance.getArticlesForSale();
          }).then(function(articleIDs) {
            $('#articlesRow').empty(); //this notation is from JQUERY

            //iterating through the array or articles 
            for(var i = 0; i < articleIDs.length; i++){
                  var articleID = articleIDs[i];
                  chainListInstance.articles(articleID.toNumber()).then(function(article){
                        //0 - sender, 2 - name, 3 - description, 4 - price, 5 - id
                        App.displayArticle(article[0], article[2], article[3], article[4], article[5]);
                  });
            }

            App.loading = false;
                        
          }).catch(function(err) {
            console.error(err.message);   //catching the error 
            App.loading = false; 
          });

     },

     



     sellArticle: function() {
      // retrieve the details of the article from front end inputs(form)
      var _article_name = $('#article_name').val();
      var _description = $('#article_description').val();
      var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
  
      if((_article_name.trim() == '') || (_price == 0)) {
        // nothing to sell
        return false;
      }
  
      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.sellArticle(_article_name, _description, _price, {
          from: App.account,
          gas: 500000
        });
      }).then(function(result) { //if success, load article

      }).catch(function(err) { //otherwise, throw error
        console.error(err);
      });
    },

    //listen (watch) events triggered by the contract
      listenToEvents: function() {
            App.contracts.ChainList.deployed().then(function(instance) {
                  instance.LogSellArticle({}, {}).watch(function(error, event) {
                        if (!error) {
                              $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                        } else {
                              console.error(error);
                        }
                        App.reloadArticles();
                  })

                  instance.LogBuyArticle({}, {}).watch(function(error, event) {
                        if (!error) {
                              $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
                        } else {
                              console.error(error);
                        }
                        App.reloadArticles();
                  })
            });
      },

      buyArticle: function() {
            event.preventDefault();

            //retrieving the article price details
            var _articleID = $(event.target).data('id');
            var _price = parseFloat($(event.target).data('value'));

            App.contracts.ChainList.deployed().then(function(instance){
                  return instance.buyArticle(_articleID, {
                        from: App.account, 
                        value: web3.toWei(_price, "ether"), 
                        gas: 500000})
            }).catch(function(error){
                  console.error(error)
            })
      }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});



