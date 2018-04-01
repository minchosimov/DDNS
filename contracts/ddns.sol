pragma solidity 0.4.19;

contract Owner{
    //event for withdraw amount from contract
    event WithdrawFromContract (address owner, uint value);
    
    address owner;
    
    //only owner modifier
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
    
    function Owner() public{
        owner = msg.sender;
    }
    
    //function returns contract's balance
    function getBalance () public view onlyOwner returns(uint){
        return this.balance;
    }
    
    //withdraw function
    function withdraw () public onlyOwner{
        require (this.balance > 0);
		WithdrawFromContract(owner,this.balance);
        owner.transfer(this.balance);
    }
}

contract DDNS is Owner{
    
    event RegisterDomain (bytes domain, bytes4 ipAddress, uint expires, address domainOwner);
    event ChangeDomainIp (bytes domain, bytes4 oldIp, bytes4 newIp);
    event TransferDomain (bytes domain, address oldOwnew, address newOwner);
    
     //the domain is bytes, because string is UTF-8 encoded and we cannot get its length
    //the IP is bytes4 because it is more efficient in storing the sequence
    
    struct DomainInfo{
        address domainOwner;
        bytes4 domainIP;
        uint expires;
    }
    
    mapping (bytes => DomainInfo) private domainInfo;
    
	//struct for receipt
    struct Receipt{ //recept
        uint amountPaidWei;
        uint timestamp;
        uint expires;
    }
    
    mapping (address => Receipt[]) private receipts; // account - receipts 
    
    
    //modifier domain's owner access 
    modifier ownerAccess(bytes domain){
        require(domainInfo[domain].domainOwner == msg.sender);
        require(domainInfo[domain].expires > now);
        _;
    }
    
    // domain contains more or equal than 5 symbols
    modifier domainNameCheck (bytes _domain){
        require(_domain.length>5 && _domain.length<30);
        _;
    }
    
    modifier domainPrice(bytes _domain){
        require(msg.value >= getPrice(_domain));
        _;
    }
    
    
    modifier domainHasAvailableForBuy (bytes domain){
        if ( domainInfo[domain].expires < now ){
            _;
        } else{
            if(domainInfo[domain].domainOwner == msg.sender){
                _;
            } else {
                revert();
            }
        }
    }
    
    function register(bytes domain, bytes4 ip) public payable domainNameCheck(domain) 
                        domainPrice(domain) domainHasAvailableForBuy(domain) {
        uint payTime = now;
        uint expTime;
        Receipt memory newRecept;
        address sender = msg.sender;
        
        if (domainInfo[domain].expires == 0 || domainInfo[domain].expires < now){
            expTime = payTime + 1 years;
        } else {
            expTime = domainInfo[domain].expires + 1 years;
        }
        newRecept = Receipt({amountPaidWei:msg.value,timestamp:payTime,expires:expTime});
        domainInfo[domain].domainOwner = sender;
        domainInfo[domain].domainIP = ip;
        domainInfo[domain].expires = expTime;
        receipts[sender].push(newRecept);
        
        RegisterDomain(domain,ip,expTime,sender);
    }
    
    function () public payable{
        
    }
    
    function edit(bytes domain, bytes4 newIp) public ownerAccess(domain){
        ChangeDomainIp(domain,domainInfo[domain].domainIP,newIp);
        domainInfo[domain].domainIP = newIp;
    }
    
    function transferDomain(bytes domain, address newOwner) public ownerAccess(domain) {
        TransferDomain (domain, domainInfo[domain].domainOwner,newOwner);
        domainInfo[domain].domainOwner = newOwner;
    }
    
    function getIP(bytes domain) public view returns (bytes4) {
        return domainInfo[domain].domainIP;
    }
    
    function getPrice(bytes domain) public pure returns (uint) {
        for (uint i = 0; i<domain.length-2;i++){
            if (domain[i] == "s"){
                if (domain[i+1] == "e" && domain[i+2] == "x"){
                    return 1.5 ether;
                } 
            }
        }
        return 1 ether;
    }
    
    function getReceipts(address account) public view returns (uint[], uint[], uint[]) {
        
        uint len = receipts[account].length;
        
        uint[] memory _amountPaidWei = new uint[](len);
        uint[] memory _timestamp = new uint[](len);
        uint[] memory _expires = new uint[](len);
        
        for (uint i = 0; i<len;i++){
            _amountPaidWei[i] = receipts[account][i].amountPaidWei;
            _timestamp[i] = receipts[account][i].timestamp;
            _expires[i] = receipts[account][i].expires;
            
        }
        return (_amountPaidWei,_timestamp,_expires);
    }
	
	//return last expiries date of domain
	function getExpDateDomain(bytes domain) public view returns(uint){
		return domainInfo[domain].expires;
	}
}