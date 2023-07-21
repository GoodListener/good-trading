const fs = require('fs');
const TestDataGenerator = require('./data/TestDataGenerator');
const TestDataHanlder = require('./data/TestDataHandler');
const tradeTester = require('./trade/tradeTester');
const txtLogger = require('../src/logger/txtLogger');

const CoinAnalyser = require('../src/coin/CoinAnalyser');
const state = require('../src/state/state');

const fileName = 'KRW-ETH-2021-01-11 083401.json';
const no = 'RBJ2.5';

// const generator = new TestDataGenerator({initialPrice: 300, strength: [0.025]})
// const data = generator.generate(35000);

const data = JSON.parse(fs.readFileSync(__dirname + '/../log/'+ fileName, 'utf8')).price;
const handler = new TestDataHanlder(data);
const analyser = new CoinAnalyser(no); // RBJ1 : 0.5%, RBJ2 : MA1020, RBJ2.1 : MA5 20

const WAITING = 1800;

while(handler.next()) {
    analyser.addTradePrice(parseFloat(handler.handle()));
    if (handler.count > WAITING) {
        let analyseData = analyser.analyse();
        analyser.pushTestTotalRecord();
        tradeTester.trade(analyseData);
    }
    
    // 거래 상태 관리
    tradeTester.setTradeState();
}

tradeTester.score();
analyser.totalRecord.score.balance = state.balance;
analyser.totalRecord.score.account = state.account;
state.market = 'TEST';
txtLogger.log(JSON.stringify(analyser.totalRecord), fileName + '-' + no);
