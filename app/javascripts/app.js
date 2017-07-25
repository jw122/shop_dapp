// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import shop_artifacts from '../../build/contracts/Shop.json'

var Shop = contract(shop_artifacts);

// A list to represent the cart array from the contract
let cartItems = []

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    Shop.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      // Upon launching the window, we want to refresh the buyer's balance and update the cart.
      self.refreshBalance();
      self.populateCart();
      //self.updateCartTotals();
    });
  },

  /* This function will call web3.eth.getBalance to retrive the current balance, in Wei, 
  of the selected account. */
  refreshBalance: function() {
    var self = this;
    var deployedContract;
    var balance;

    Shop.deployed().then(function(instance){
      deployedContract = instance;
      return web3.eth.getBalance(account, function(err, bal) {

        if (err!= null) {
          alert("There was an error getting your balance.");
          return;
        }

        balance = bal;
        var balance_element = document.getElementById("balance");
        balance_element.innerHTML = balance.toNumber();

      })

      }).catch(function(e){
        console.log(e);
      });

  },

  /* This function will trigger the getCartItems() function in the contract to retrive the cart array,
  and then loop through the array to populate the cartItems array in this .js environment. */
  populateCart: function() {
    var self = this;
    var deployedContract;


    Shop.deployed().then(function(instance) {
      deployedContract = instance;
      return deployedContract.getCartItems();
      
    }).then(function(cartArray){
      console.log(cartArray.length);
      for (let i=0; i < cartArray.length; i++) {
/*        We had stored item names as byes32 on the blockchain,
        so we'll use 'toUtf8' to convert bytes32 back to strings*/
        //cartItems[web3.toUtf8(cartArray[i])] = "cartItem-" + i;
        //cartItems.push(web3.toUtf8(cartArray[i]));
        var converted = web3.toUtf8(cartArray[i]);
        if (!(cartItems.includes(converted))) {
          cartItems.push(web3.toUtf8(cartArray[i]));
        }
      }
        // Once we're done retrieving cart items, we use the array to fill out the rows in the front-end
        // table.
        self.setupCartRows();
        self.populateCartQty();
    }).catch(function(e){
      console.log(e);
    })
  },

  /* This function goes through each item in the cartItems array and places it in the HTML table. */
  setupCartRows: function() {
    $("#cartTable tbody tr").remove();
    // Object.keys(cartItems).forEach(function (item) { 
    cartItems.forEach(function (item) { 
      $("#cartItem-rows").append("<tr><td>" + item + "</td><td id='" + item + "'></td></tr>");
    });
  },
  
  populateCartQty: function() {
    var self = this; 
    //let itemNames  = Object.keys(cartItems);
    for (var i = 0; i < cartItems.length; i++) {
      let currItem = cartItems[i];
      Shop.deployed().then(function(contractInstance) {
        contractInstance.getItemCount.call(currItem).then(function(v) {
          $("#" + currItem).html(v.toString());
        });
      });
    }
    self.updateCartTotals();
  },

  /* This function calls on the contracts getCartItems() and getTotalPrice() functions to retrieve
  the cart's totals. Then it udpates the front-end elements accordingly. */
  updateCartTotals: function() {
    var self = this;
    var deployedContract;

    Shop.deployed().then(function(instance){
      deployedContract=instance;

      deployedContract.getCartItems().then(function(cartArray){
        console.log("cart length: ", cartArray.length);
        var total_items_element = document.getElementById("totalItems");
        total_items_element.innerHTML = cartArray.length;
      })

      deployedContract.getTotalPrice().then(function(totalPrice){
        console.log("total price: ", totalPrice.toNumber());
        var total_price_element = document.getElementById("totalPrice");
        total_price_element.innerHTML = totalPrice.toNumber();
      })
    })
  },

  addToCart: function(item) {
    var self = this;
    var deployedContract;

    Shop.deployed().then(function(instance){
      deployedContract = instance;

      deployedContract.addItem(item, {from: account}).then(function() {
        return deployedContract.getCartItems().then(function(cartArray){
          console.log("cartArray length: ",cartArray.length);
          for (let i=0; i < cartArray.length; i++) {
          /* We had stored item names as byes32 on the blockchain,
            so we'll use 'toUtf8' to convert bytes32 back to strings*/
            //cartItems[web3.toUtf8(cartArray[i])] = "cartItem-" + i;
            var converted = web3.toUtf8(cartArray[i]);
            if (!(cartItems.includes(converted))) {
              cartItems.push(web3.toUtf8(cartArray[i]));
            }
            
          }
            // Once we're done retrieving cart items, we use the array to fill out the rows in the front-end
            // table.
          self.setupCartRows();
          self.populateCartQty();
        })
      })
    })
  },

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Wei, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
