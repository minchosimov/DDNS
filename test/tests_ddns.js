
const ddns = artifacts.require("DDNS");

const increaseTime = function(duration) {
	
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}

contract('DDNS', function(accounts){	
	it("should withdraw only from owner",async() =>{
		let instance = await ddns.deployed();
		
		var acc1 = accounts[1];
		var owner = accounts[0];
		
		var balance = await instance.getBalance({from:owner});
		
		if (balance.toNumber() == 0){
		
			try{
				await instance.sendTransaction({from:acc1,value:web3.toWei(1, "ether")});
			}catch (e){
				assert (false,`fallback transaction fail`);
			}
		}
		
		balance = await instance.getBalance({from:owner});
		
		assert(balance.toNumber()>0,`${balance.toNumber()} balance`)
		
		try {
			await instance.withdraw({from:acc1});
			assert(false,`withdraw from not owner address success`);
		} catch (e){
			assert(true,"");
		}
	})
	
	
	it("shouldn't register engaged domain",async() => {
		let instance = await ddns.deployed();
		var acc1 = accounts[1];
		var acc2 = accounts[2];
		
		try {
			await instance.register("solidity","212.34.35.67",{from: acc1,value:web3.toWei(1, "ether")});
		}catch(e){
			assert(false,e.toString());
		
		}
		
		try {
			await instance.register("solidity","212.45.67.89",{from: acc2,value:web3.toWei(1, "ether")});
			assert(false,"the prohibition on engaged domain registration is not working");
		} catch (e){
		}
				
	})
	
	it("should extend exp.data only from domain owner", async() =>{
		
		let instance = await ddns.deployed();
		
		let acc = accounts[1];
		let acc1 = accounts[2];
		
		try {
			await instance.register("solidity","212.45.67.89",{from: acc,value:web3.toWei(1, "ether")});
		} catch(e){
			assert(false,`throw while register domain, error - ${e.toString()}`);
		}
		
		let exp1 = await instance.getExpDateDomain("solidity");
		
		try {
			await instance.register("solidity","212.45.67.89",{from: acc,value:web3.toWei(1, "ether")});
		} catch(e){
			assert(false,`throw while exp. domain, error - ${e.toString()}`);
		}
		
		let exp2 = await instance.getExpDateDomain("solidity");
		
		assert(exp2 >= exp1,`renewal does not work ${exp1} , ${exp2}`);
		
	})
	
	it("should register engaged domain after expiries date",async() => {
		let instance = await ddns.deployed();
		var acc1 = accounts[1];
		var acc2 = accounts[2];
		
		let exp = await instance.getExpDateDomain("solidity");
		
		let timestamp = Math.round((new Date()).getTime() / 1000);
		
		let interval = exp - timestamp+60;
		
		
		await increaseTime(interval);
		
		try {
			await instance.register("solidity","212.45.67.89",{from: acc2,value:web3.toWei(1, "ether")});
		} catch (e){
			assert(false,`after expiries date domain can buy from other account but there is a problem ${interval} ${exp} ${timestamp}`);
		}
				
	})
	
	it("should get domain price correctly", async() =>{
		
		let instance = await ddns.deployed();
		
		let acc = accounts[1];
		
		var price = await instance.getPrice("solidity",{from:acc});
		
		assert.equal(price.toNumber(),web3.toWei(1,"ether"),`the price of normal domain is 1 ether, but function returns ${price.toNumber()} wei `);
		
		price = await instance.getPrice("bublesex",{from:acc});
		
		assert.equal(price.toNumber(),web3.toWei(1.5,"ether"),`the price of domain contains "sex" is 1.5 ether, but function returns ${price.toNumber()} wei `);
		
	})
	
	
})