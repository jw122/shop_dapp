pragma solidity ^0.4.4;

contract Shop {

    /* Variables we will be using in this contract
    We'll store the items list as bytes32, and then in the front-end use toUtf8 method to convert from bytes32 to string */
    address public buyer; // Buyer's address, in this case also msg.sender
    address public seller; // Seller's address, aka store owner
    uint public currentTotal; // We'll use a uint to keep track of the cart's total price
    bytes32[] public cart; // Buyer's list of items, aks cart
    mapping (bytes32 => uint) public priceTable; // We use a map to keep track of each item's price

  function Shop(address _seller) {
    // constructor
    buyer = msg.sender;
    seller = _seller;
    currentTotal = 0;
    
    // Is there a way to initialize this more elegantly?
    priceTable["acai"] = 2;
    priceTable["honeyMilkTea"] = 1;
    priceTable["tiramisu"] = 2;
    priceTable["vanillaIceCream"] = 1;
    priceTable["giantKitKat"] = 3;
    priceTable["hersheysKisses"] = 1;
    
  }
  
  function addItem(bytes32 item) {
      cart.push(item);
      currentTotal = currentTotal + priceTable[item];
  }
  
  function getCartItems() constant returns (bytes32[]){
      return cart;
  }
  
  function getTotalPrice() constant returns (uint) {
      return currentTotal;
  }

}
