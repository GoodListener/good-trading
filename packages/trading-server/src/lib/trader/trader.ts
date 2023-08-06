import Statement from './statement'
const order = require('../api/order');
const state = require('../state/state');

const statement = new Statement();

function trade(analyseData) {
  order.findOrderChance().then(orderInfo => {
    if (!orderInfo) return;

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
      console.log('cancel buy');
    }
    if (analyseData.sellTiming) {
      analyseData.sellTiming = false;
      console.log('cancel sell');
    }
  }).catch(e => {
    console.error(e);
  })
}

function askOrder(orderInfo, tradePrice) {
  order.askOrder(orderInfo.ask_account.balance, tradePrice).then(tradeResult => {
    if (!tradeResult) return;

    state.trade = 'ask_wait';
    state.tradePrice = tradePrice;
    state.balance = 0;
    state.expectPrice = (orderInfo.ask_account.balance * tradePrice * 0.999);
    console.log(tradeResult);
    statement.ask(tradePrice);
  })
}

function bidOrder(orderInfo, tradePrice) {
  order.bidOrder(state.balance / tradePrice, tradePrice).then(tradeResult => {
    if (!tradeResult) return;

    state.trade = 'bid_wait';
    state.tradePrice = tradePrice;
    state.balance = 0;
    console.log(tradeResult);
    statement.bid(tradePrice);
  })
}

function setTradeState() {
  order.findOrderList().then(result => {
    if (!result) return;

    let existTradingOrder = false;
    result.forEach(tradingOrder => {
      if (tradingOrder.market == state.market) {
        if (tradingOrder.side == 'ask') {
          state.trade = 'ask_wait';
          state.balance = 0;
          console.log(new Date().toLocaleString());
          console.log('balance : ' + state.balance + ', state : ' + state.trade);
        } else if (tradingOrder.side == 'bid') {
          state.trade = 'bid_wait';
          state.balance = 0;
          console.log(new Date().toLocaleString());
          console.log('balance : ' + state.balance + ', state : ' + state.trade);
        }
        existTradingOrder = true;
      }
    });
    if (!existTradingOrder) {
      if (state.trade == 'bid_wait') {
        state.trade = 'bided';
        console.log(new Date().toLocaleString());
        console.log('balance : ' + state.balance + ', state : ' + state.trade);
      } else if (state.trade == 'ask_wait') {
        state.trade = 'asked';
        state.balance = state.expectPrice;
        console.log(new Date().toLocaleString());
        console.log('balance : ' + state.balance + ', state : ' + state.trade);
      }
    }
  }).catch(e => {
    console.error(e);
  })
}

function score() {
  console.log('');
  console.log('score');
  console.log('----------');
  console.log(statement);
  console.log('----------');
  console.log('balance : ' + state.balance);
}

module.exports = {
  trade,
  setTradeState,
  score
}