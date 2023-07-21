const dotenv = require('dotenv');
dotenv.config();
const order = require('../src/api/order');
const state = require('../src/state/state');
const CoinAnalyser = require('../src/coin/CoinAnalyser');
const txtLogger = require('../src/logger/txtLogger');
const fs = require('fs');

const data = fs.readFileSync(__dirname + '/../log/KRW-XRP-Sun Jan 10 2021.json', 'utf8');
console.log(JSON.parse(data));

// const analyser = new CoinAnalyser();

// for (var i = 1; i <= 300; i++) {
//     analyser.tradePrices.push(i);
//     analyser.analyse();
// }

// state.market = "KRW-XRP";

// txtLogger.log(new Date().toLocaleString());

// order.findOrderChance().then(orderInfo => {
//     console.log(orderInfo)
// });
// function setTradeState() {
//     order.findOrderList().then(result => {
//         result.forEach(foundOrder => {
//             console.log(foundOrder.market);
//         })
//     })
// }

/*
if (state.trade == 'bid_wait' && foundOrder.length == 0) {
    state.trade = 'bided';
} else if (state.trade == 'ask_wait' && foundOrder.length == 0) {
    state.trade = 'asked';
    balance = expectPrice;
}

if (foundOrder.length > 0 && foundOrder[0].side == 'ask') {
    state.trade = 'ask_wait';
    balance = 0;
} else if (foundOrder.length > 0 && foundOrder[0].side == 'bid') {
    state.trade = 'bid_wait';
    balance = 0;
}
console.log(state.trade);
*/