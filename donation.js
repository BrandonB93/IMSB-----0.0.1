console.log("Donations Contract Interface started...");

(async function(){
    const serverUrl = "https://3saxoghd4wl8.usemoralis.com:2053/server";
    const appId = "WHTsPUDVT1z88bSj1tqbLUplTD0gbN265eKahRGW";
    Moralis.start({ serverUrl, appId });
    console.log("Server Connecting...")
})();


function getAddress(){
    let rawAddress = Moralis.User.current().get('ethAddress');
    let firstFive = rawAddress.substring(0, 6);
    let lastFive = rawAddress.slice(rawAddress.length - 4);
    let _address = `User: ${firstFive}...${lastFive}`;
    document.getElementById('userAddress').textContent = _address;
    console.log(getAddress);
    
}




    // ---------> SMART CONTRACT EVENTS ----------------------->> |

donate = async () => {
    user = await Moralis.authenticate({ signingMessage: "Contract Donation Authentication" });
    console.log("Contract code ran");
    var contract = {
        contractAddress:"0x356d2E7a0d592bAd95E86d19479c37cfdBb68Ab9",
        functionName: "newDonation",
        abi:[{"inputs":[{"internalType":"string","name":"note","type":"string"}],"name":"newDonation","outputs":[],"stateMutability":"payable","type":"function"}],
        params:{
         note:"Thanks for your work"
        },
        msgValue: Moralis.Units.ETH(0.1)
    }
    console.log("Your Donation has been sent Successfully");
    await Moralis.executeFunction(contract);
    console.log("Smart Contract Intergration Testing Running....");

}

transfer = async () => {
    user = await Moralis.authenticate({ signingMessage: "Contract Transfer Authentication" });
    console.log("Contract code ran");
    var contract = {
        contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7",
        functionName: "transfer",
        abi:[],
        params:{},
        msgValue: Moralis.Units.ETH("0.1")
    }
    console.log("Transfer sent Successfully");
    await Moralis.executeFunction(contract);
    console.log("Transfer event working..");
};

getContractEvents = async () => {
    const ABI = {
        anonymous: false,
        inputs: [
          { indexed: true, name: "from", type: "address" },
          { indexed: true, name: "to", type: "address" },
          { indexed: false, name: "value", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
      };
      
      const options = {
        chain: "BSC Testnet",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        limit: "3",
        abi: ABI,
      };
      const events = Moralis.Web3API.native.getContractEvents(options);
      console.log(ABI);
      console.log(getContractEvents);
}

  
getTransactions = async () => {
        // get mainnet transactions for the current user
    const transactions = await Moralis.Web3API.account.getTransactions();

    // get BSC transactions for a given address
    // with most recent transactions appearing first
    const options = {
    chain: "bsc",
    address: "0x3d6c0e79a1239df0039ec16Cc80f7A343b6C530e",
    from_block: "0",
    };
    const moreTransactions = await Moralis.Web3API.account.getTransactions(options);
    console.log(moreTransactions);
}; 

getNativeBalance = async () => {

        // get mainnet native balance for the current user
        const balance = await Moralis.Web3API.account.getNativeBalance();

        // get BSC native balance for a given address
        const options = {
        chain: "bsc",
        address: "0x3d6c0e79a1239df0039ec16Cc80f7A343b6C530e",
        to_block: "1234",
        };
        const getNativebalance = await Moralis.Web3API.account.getNativeBalance(options);
        console.log(getNativebalance);
};

    // /    EVENT LISTENERS ~>

document.getElementById("btn-get-transactions").onclick = getTransactions;
document.getElementById("btn-transfer").onclick = transfer;
document.getElementById("btn-donate").onclick = donate;
document.getElementById("btn-get-native-balance").onclick = getNativeBalance;
document.getElementById("btn-get-contract-events").onclick = getContractEvents;
