const Statement = require('../../src/coin/Statement');
const state = require('../../src/state/state');
const order = require('../order/orderTester');

const statement = new Statement();

function trade(analyseData) {
    const orderInfo = order.findOrderChance();
    if ((state.trade == 'bided' || state.trade == 'non')
        && (orderInfo.ask_account.balance * orderInfo.ask_account.avg_buy_price) > 5000) {

        if (analyseData.sellTiming) {
            analyseData.avgBuyPrice = analyseData.currentPrice;
            askOrder(orderInfo, analyseData.currentPrice);
            analyseData.sellTiming = false;
        }

    } else if ((state.trade == 'asked' || state.trade == 'non') 
                && state.balance > 5000) {

        if (analyseData.buyTiming) {
            analyseData.avgBuyPrice = analyseData.currentPrice;
            bidOrder(orderInfo, analyseData.currentPrice);
            analyseData.buyTiming = false;
        }
    }

    if (analyseData.buyTiming) {
        analyseData.buyTiming = false;
        // console.log('cancel buy');
    }
    if (analyseData.sellTiming) {
        analyseData.sellTiming = false;
        // console.log('cancel sell');
    }
}

function askOrder(orderInfo, tradePrice) {
    const tradeResult = order.askOrder(orderInfo.ask_account.balance, tradePrice)
    if (!tradeResult) return;

    state.trade = 'ask_wait';
    state.tradePrice = tradePrice;
    state.balance = 0;
    state.expectPrice = (orderInfo.ask_account.balance * tradePrice * 0.999);
    statement.ask(tradePrice);
}

function bidOrder(orderInfo, tradePrice) {
    const tradeResult = order.bidOrder(state.balance / tradePrice, tradePrice)
    if (!tradeResult) return;
    
    state.account.balance = state.balance / tradePrice;
    state.account.price = tradePrice;
    state.trade = 'bid_wait';
    state.tradePrice = tradePrice;
    state.balance = 0;
    statement.bid(tradePrice);
}

function setTradeState() {
    const result = order.findOrderList();
    if (!result) return;

    if (state.trade == 'bid_wait') {
        state.trade = 'bided';
    } else if (state.trade == 'ask_wait') {
        state.trade = 'asked';
        state.account.balance = 0;
        state.account.price = 0;
        state.balance = state.expectPrice;
    }
}

function score() {
    console.log('');
    console.log('score');
    console.log('----------');
    console.log(statement);
    console.log('----------');
    console.log('balance : ' + state.balance);
    console.log('account balance : ' + (state.account.price * state.account.balance));
}

module.exports = {
    trade,
    setTradeState,
    score
}