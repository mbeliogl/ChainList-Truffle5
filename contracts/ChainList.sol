pragma solidity >0.4.99 <0.6.0;

import "./Ownable.sol";

// 'is' is like 'extends' in other languages 
// solidity supports multiple inheritances 
contract ChainList is Ownable {

    //declaring custom types 
    struct Article{
        address payable seller ; 
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
    function sellArticle(string memory _name, string memory _description, uint256 _price) public {
        //incrementing articleCounter when article is sold 
        articleCounter ++;

        //initializing values in the same order they are declared in the struct 
        articles[articleCounter] = Article(
            msg.sender,
            address(0),
            _name, 
            _description,
            _price, 
            articleCounter // equals ID 
        );

        emit LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    //buying an article. Event and state variables already defined.
    //takes index of article to buy 
    function buyArticle(uint256 _id) public payable {
        //check if there is an article for sale
        require(articleCounter > 0, "There should be at least one article");

        //id correcsponds to article that exists 
        require(_id > 0 && _id <= articleCounter, "Article with this ID does not exist");

        //*** retrieving the article from the mapping ***
        Article storage article = articles[_id];


        //check if article has already been sold
        require(article.buyer == address(0), "Article was already sold");

        //restrict seller from buying their own article 
        require(msg.sender != article.seller, "Seller cannot buy his own article");

        //check if value sent = price of he article 
        require(msg.value == article.price, "Value provided does not match price of article");

        //keeping track of buyer's info 
        article.buyer = msg.sender; 

        //buyer can pay seller 
        article.seller.transfer(msg.value);

        emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }


    //get the total number of articles 
    function getNumOfArticles() public view returns(uint256) {
        return articleCounter; 
    }

    //get and return all article IDs for articles that are (still) for same 
    function getArticlesForSale() public view returns(uint[] memory){
        //preparing output arr 
        uint[] memory articleIDs = new uint[](articleCounter); //creating local memory-only arr the size of articleCounter
        
        uint numberOfArticlesForSale = 0; 

        for(uint i = 1; i <= articleCounter; i++){
            //only track the ID is the article is still for sale
            if(articles[i].buyer == address(0)){
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