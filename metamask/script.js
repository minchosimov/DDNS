//this function will be called when the whole page is loaded
window.onload = function(){
	if (typeof web3 === 'undefined') {
		//if there is no web3 variable
		displayMessage("Error! Are you sure that you are using metamask?");
	} else {
		displayMessage("Welcome to our DAPP!");
		init();
	}
}

var contractInstance;

var abi = [
	{
		"constant": true,
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			},
			{
				"name": "newIp",
				"type": "bytes4"
			}
		],
		"name": "edit",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			}
		],
		"name": "getExpDateDomain",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			}
		],
		"name": "getPrice",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			},
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferDomain",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			}
		],
		"name": "getIP",
		"outputs": [
			{
				"name": "",
				"type": "bytes4"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "domain",
				"type": "bytes"
			},
			{
				"name": "ip",
				"type": "bytes4"
			}
		],
		"name": "register",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "account",
				"type": "address"
			}
		],
		"name": "getReceipts",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			},
			{
				"name": "",
				"type": "uint256[]"
			},
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "domain",
				"type": "bytes"
			},
			{
				"indexed": false,
				"name": "ipAddress",
				"type": "bytes4"
			},
			{
				"indexed": false,
				"name": "expires",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "domainOwner",
				"type": "address"
			}
		],
		"name": "RegisterDomain",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "domain",
				"type": "bytes"
			},
			{
				"indexed": false,
				"name": "oldIp",
				"type": "bytes4"
			},
			{
				"indexed": false,
				"name": "newIp",
				"type": "bytes4"
			}
		],
		"name": "ChangeDomainIp",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "domain",
				"type": "bytes"
			},
			{
				"indexed": false,
				"name": "oldOwnew",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "TransferDomain",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "WithdrawFromContract",
		"type": "event"
	}
]; //TODO

var address = "0x8cdaf0cd259887258bc13a92c0a6da92698644c0"; //TODO
var acc;

function init(){
	var Contract = web3.eth.contract(abi);
	contractInstance = Contract.at(address);
	updateAccount();
}

function updateAccount(){
	//in metamask, the accounts array is of size 1 and only contains the currently selected account. The user can select a different account and so we need to update our account variable
	acc = web3.eth.accounts[2];
}

function displayPrice(values){
	var el = document.getElementById("minPrice");
	el.innerHTML = values;
}

function displayPrice(text){
	var el = document.getElementById("minPrice");
	el.innerHTML = text;
}

function displayMessage(text){
	var pp = document.getElementById("message");
	pp.innerHTML = text;
}


function onSubmitPressed(){
	updateAccount();
    
    var domain = document.getElementById("domain").value;
	var ip = document.getElementById("id").value;
	var price  = document.getElementById("price").value;
    
	if (domain.length > 5 ){
		contractInstance.register(domain,ip, {"from": acc,"value":web3.toWei(price, "ether")}, function(err, res){
		if(!err){
			displayMessage("Success! Transaction hash: " + res.valueOf());
		} else {
			displayMessage("Something went wrong. Are you sure that domain is free or price is enough? "+err.valueOf());
		}
		})
	} else {
		displayMessage("Please, input correct values");
	}
}

function onGetPrice(){
	updateAccount();	
	
	var domain = document.getElementById("domain").value;
	displayMessage(domain);
	
	if (domain.length >= 5){
		contractInstance.getPrice.call(domain,{"from":acc}, function(err, res) {
		if(!err){
			displayPrice("Minimum price for the domain is " + res.valueOf()+" wei");
		} else {
			displayMessage("Something went horribly wrong. Deal with it:", err);
		}
		});
	}	
}
