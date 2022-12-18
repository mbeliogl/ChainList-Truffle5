pragma solidity ^0.4.18;

import "./Ownable.sol";

// 'is' is like 'extends' in other languages 
// solidity supports multiple inheritances 
contract ChainList is Ownable {

    //declaring custom types 
    struct Article{
        address seller; 
        address buyer; 
        string name; 
        string description; 
        uint256 price;
        uint256 id; 
    }

    //defining state variables 
    //map with articleID to articles 

    //address owner; 
    mapping(uint256 => Article) public articles;
    uint256 articleCounter;

    // defining events 
    event LogSellArticle(
        uint256 indexed _id, 
        address indexed _seller, //indexed so we can filter by seller address on client side 
        string _name, 
        uint256 _price
    );

    event LogBuyArticle (
        uint256 indexed _id,
        address indexed _seller, 
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    //function modifier section 
    /*
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    

    //constructor 
    function ChainList() public{ 
        owner = msg.sender;
    }
    */

    //deactivation function 
    //only allow the contract owner to call this function 
    function kill() public onlyOwner {
        selfdestruct(owner);
    }


    //selling an article 
    function sellArticle(string _name, string _description, uint256 _price) public {
        //incrementing articleCounter when article is sold 
        articleCounter ++;

        //initializing values in the same order they are declared in the struct 
        articles[articleCounter] = Article(
            msg.sender,
            0x0,
            _name, 
            _description,
            _price, 
            articleCounter // equals ID 
        );

        LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    //buying an article. Event and state variables already defined.
    //takes index of article to buy 
    function buyArticle(uint256 _id) payable public {
        //check if there is an article for sale
        require(articleCounter > 0);

        //id correcsponds to article that exists 
        require(_id > 0 && _id <= articleCounter);

        //*** retrieving the article from the mapping ***
        Article storage article = articles[_id];


        //check if article has already been sold
        require(article.buyer == 0x0);

        //restrict seller from buying their own article 
        require(msg.sender != article.seller);

        //check if value sent = price of he article 
        require(msg.value == article.price);

        //keeping track of buyer's info 
        article.buyer = msg.sender; 

        //buyer can pay seller 
        article.seller.transfer(msg.value);

        LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }


    //get the total number of articles 
    function getNumOfArticles() public view returns(uint256) {
        return articleCounter; 
    }

    //get and return all article IDs for articles that are (still) for same 
    function getArticlesForSale() public view returns(uint[]){
        //preparing output arr 
        uint[] memory articleIDs = new uint[](articleCounter); //creating local memory-only arr the size of articleCounter
        
        uint numberOfArticlesForSale = 0; 

        for(uint i = 1; i <= articleCounter; i++){
            //only track the ID is the article is still for sale
            if(articles[i].buyer == 0x0){
                articleIDs[numberOfArticlesForSale] = articles[i].id; 
                numberOfArticlesForSale ++; 
            }
        }

        //copy the articleIDs array into smaller forSale array 
        uint[] memory forSale = new uint[](numberOfArticlesForSale);

        for(uint j; j < numberOfArticlesForSale; j++){
            forSale[j] = articleIDs[j];
        }

        return forSale;

    }


}