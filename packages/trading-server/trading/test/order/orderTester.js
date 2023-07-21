const state = require('../../src/state/state');

const lockedOrder = [];
const account = {
    ask_account: {balance: 0, avg_buy_price: 300},
}

function findOrderChance() {
    return account;
}

function bidOrder(volume, price) {
    account.ask_account.balance = volume;
    account.ask_account.avg_buy_price = price;
    account.ask_account.fee = 0.0005;
    return account;
}

function askOrder(volume, price) {
    account.ask_account.balance = volume;
    account.ask_account.avg_buy_price = price;
    account.ask_account.fee = 0.0005;
    return account;
}

function findOrderList() {
    return lockedOrder;
}

module.exports = {
    findOrderChance,
    bidOrder,
    askOrder,
    findOrderList
}