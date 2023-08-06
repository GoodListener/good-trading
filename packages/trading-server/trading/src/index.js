const { getTicker } = require('./api/market.js');
const CoinAnalyser = require('./coin/CoinAnalyser.js');
const txtLogger = require('./logger/txtLogger.js');
const trader = require('./trade/trader');
const state = require('./state/state');

/**
 * RBJ1: 0.5% trade
 * RBJ2: ma10 ma20
 * RBJ2.5: ma check base 10 20 
 * default: RBJ2
 */
const analyser = new CoinAnalyser('RBJ2');

// trade market
const MARKET = 'KRW-ETH';
state.market = MARKET;
state.tradeMode = 'record'; // 'trade', 'record'

// time
const time = {
    progressTime: 0
};
const INTERVAL = 1000 * 1//초 간격
const MAX_WAITING_TIME = INTERVAL * 60 * 30//분
const MAX_TRADE_TIME = 1000 * 60 * 60 * 24//시간동안 돌리자

// state
const runningState = {
    runState: 'stop'
}

const startDate = dateFormat(new Date(), 'yyyy-mm-dd hhMMss');

console.clear();
console.log(MARKET);

console.log(startDate);

producer.init(MARKET + 2);

const runningInterval = setInterval(() => {
    time.progressTime += INTERVAL;

    if (MAX_WAITING_TIME > time.progressTime) {
        runningState.runState = 'waiting';
    } else if (MAX_TRADE_TIME < time.progressTime) {
        runningState.runState = 'stop';
    } else {
        runningState.runState = 'start';
    }

    // 데이터 쌓기
    if (runningState.runState != 'stop') {
        getTicker(MARKET).then(result => {
            if (!result && !result.length) return;
            result.forEach(coinInfo => {
                analyser.addTradePrice(coinInfo.trade_price);
            
                // 데이터 분석 및 거래
                if (runningState.runState == 'start' || runningState.runState == 'waiting') {
                    const analyseData = analyser.analyse(coinInfo.trade_price);
                    analyser.pushTotalRecord();
                    
                    producer.sendMessage('data', JSON.stringify(analyser.getRecord()));
                    if (state.tradeMode == 'trade') {
                        trader.trade(analyseData);
                    } else {
                        analyseData.sellTiming = false;
                        analyseData.buyTiming = false;
                    }
                }
            })
        }).catch(e => {
            console.error(e);
        })

        // 거래 상태 관리
        trader.setTradeState();
    } else {
        trader.score();
        analyser.totalRecord.score.balance = state.balance;
        analyser.totalRecord.score.account = state.account;
        txtLogger.log(JSON.stringify(analyser.totalRecord), startDate + '-' + dateFormat(new Date(), 'yyyy-mm-dd hhMMss'));
        clearInterval(runningInterval);
    }
    
}, INTERVAL);
