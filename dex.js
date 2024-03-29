let currentTrade = {};
let currentSelectSide;
let dexTokens;
let newTokens;

let dex;

async function init2(){
    currentUser = Moralis.User.current();
    if(currentUser){
        document.getElementById("swap_button").disabled = false;
    }
}



async function listAvailableTokens(){
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
      });
    dexTokens = result.tokens;

    newTokens = Object.values(dexTokens);
    newTokens.sort(function(a,b){
        if(a.symbol < b.symbol) { return -1; }
        if(a.symbol > b.symbol) { return 1; }
        return 0;
    });

    let parent = document.getElementById("token_list");
    newTokens.forEach(e=>{
        let div = document.createElement("div");
        div.setAttribute("data-address", e.address)
        div.className = "token_row";
        let html = `
        <img class="token_list_img" src="${e.logoURI}">
        <span class="token_list_text">${e.symbol}</span>
        `
        div.innerHTML = html;
        div.onclick = (() => {selectToken(e.address)});
        parent.appendChild(div);
    })

}

function selectToken(address){
    closeModal();
    console.log(dexTokens);
    currentTrade[currentSelectSide] = dexTokens[address];
    console.log(currentTrade);
    renderInterface();
    getQuote();
}

function renderInterface(){
    if(currentTrade.from){
        document.getElementById("from_token_img").src = currentTrade.from.logoURI;
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }
    if(currentTrade.to){
        document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}



function openModal(side){
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}
function closeModal(){
    document.getElementById("token_modal").style.display = "none";
}

async function getQuote(){
    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    
    let amount = Number( 
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    )

    const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
    })
    console.log(quote);
    document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
    document.getElementById("to_amount").value = quote.toTokenAmount / (10**quote.toToken.decimals)
}

async function trySwap(){
    let address = Moralis.User.current().get("ethAddress");
    let amount = Number( 
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    )
    if(currentTrade.from.symbol !== "ETH"){
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currentTrade.from.address, // The token you want to swap
            fromAddress: address, // Your wallet address
            amount: amount,
        })
        console.log(allowance);
        if(!allowance){
            await Moralis.Plugins.oneInch.approve({
                chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
                tokenAddress: currentTrade.from.address, // The token you want to swap
                fromAddress: address, // Your wallet address
              });
        }
    }
    try {
        let receipt = await doSwap(address, amount);
        alert("Swap Complete");
    
    } catch (error) {
        console.log(error);
    }
}

function doSwap(userAddress, amount){
    return Moralis.Plugins.oneInch.swap({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
        fromAddress: userAddress, // Your wallet address
        slippage: 1,
      });
}

let symbolSearch = document.getElementById('token-search');
symbolSearch.addEventListener("keyup", e=> {
    
    let array = [];
    let tokenList = newTokens;
    let search = document.getElementById('token-search').value;
    if(search === ""){newTokens = tokenList;}

    newTokens.forEach(e => {
            if (e.symbol.toLowerCase().includes(search)) {
                array.push(e);
            }
            })

        let parent = document.getElementById("token_list");
        parent.innerHTML = '';
        array.forEach(e=>{
            let div = document.createElement("div");
            div.setAttribute("data-address", e.address)
            div.className = "token_row";
            let html = `
            <img class="token_list_img" src="${e.logoURI}">
            <span class="token_list_text">${e.symbol}</span>
            `
            div.innerHTML = html;
            div.onclick = (() => {selectToken(e.address)});
            parent.appendChild(div);
        })
    })

init2();
if (window.location.pathname.endsWith(dashboard)){
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_token_select").onclick = (() => {openModal("from")});
document.getElementById("to_token_select").onclick = (() => {openModal("to")});
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;
}