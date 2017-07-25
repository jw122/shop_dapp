pragma solidity ^0.4.4;

contract Shop {

    /* Variables we will be using in this contract
    We'll store the items list as bytes32, and then in the front-end use toUtf8 method to convert from bytes32 to string */
    address public buyer; // Buyer's address, in this case also msg.sender
    address public seller; // Seller's address, aka store owner
    uint public currentTotal; // We'll use a uint to keep track of the cart's total price
    uint public itemsInCart;
    bytes32[] public cart; // Buyer's list of items, aka cart: an array of bytes32
    mapping (bytes32 => uint) public priceTable; // We use a map to keep track of each item's price
    mapping (bytes32 => uint) public cartItems; // A mapping from cart item to quantity

  /* The constructor will take in the seller's address as a parameter. It will also initialize the buyer, seller, 
  currentTotal and priceTable variables. The constructor will be called once when you deploy the contract
  to the blockchain. */
  function Shop(address _seller) {
    
    buyer = msg.sender;
    seller = _seller;
    currentTotal = 0;
    itemsInCart = 0;
    
    // Is there a way to initialize this more elegantly?
    priceTable["acai"] = 2;
    priceTable["honeyMilkTea"] = 1;
    priceTable["tiramisu"] = 2;
    priceTable["vanillaIceCream"] = 1;
    priceTable["giantKitKat"] = 3;
    priceTable["hersheysKisses"] = 1;
    
  }
  
  /* This function will add the item passed in as an argument to the cart, by pushing it into the
  car array. Then, it will update the total price of the cart based on the current item's price. */
  function addItem(bytes32 item) {
      cart.push(item);
      currentTotal = currentTotal + priceTable[item];
      cartItems[item] += 1;
      itemsInCart += 1;
  }
  
  /* This function simply returns the cart array itself */
  function getCartItems() constant returns (bytes32[]){
      return cart;
  }
  
  /* This function returns the current total price of the cart */
  function getTotalPrice() constant returns (uint) {
      return currentTotal;
  }

  function getItemCount(bytes32 item) constant returns (uint) {
    return cartItems[item];
  }

  function getTotalCount() constant returns (uint) {
    return itemsInCart;
  }
  
  function getSeller() constant returns(address) {
    return seller;
  }

}
