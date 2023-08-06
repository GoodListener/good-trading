import shape from './shape'

const MINUTE_COUNT = 60;
const MA_UNIT_MINUTE = {
  AVG_120: MINUTE_COUNT * 120,
  AVG_60: MINUTE_COUNT * 60,
  AVG_30: MINUTE_COUNT * 30,
  AVG_20: MINUTE_COUNT * 20,
  AVG_10: MINUTE_COUNT * 10,
  AVG_5: MINUTE_COUNT * 5,
  AVG_1: MINUTE_COUNT * 1,
}
const BID_LIMIT = 5;
const ASK_LIMIT = 5;

export default class CoinAnalyser {
  model
  count = 0
  totalRecord = {
    max: [],
    min: [],
    avg: [],
    ma1Price: [],
    ma5Price: [],
    ma10Price: [],
    ma20Price: [],
    ma60Price: [],
    ma120Price: [],
    ma10PricesIncline: [],
    price: [],
    avgBuyPrice: [],
    avg1perDownPrice: [],
    avg2perDownPrice: [],
    avg1perUpPrice: [],
    buyWaiting: [],
    buyTiming: [],
    sellTiming: [],
    time: [],
    score: {
      balance: 0,
      account: { price: 0, balance: 0 }
    }
  }
  prices = [];
  ma1Prices = [];
  ma5Prices = [];
  ma10Prices = [];
  ma20Prices = [];
  ma30Prices = [];
  ma60Prices = [];
  ma120Prices = [];

  // 기울기
  ma10PricesIncline = 0;
  ma20PricesIncline = 0;
  ma30PricesIncline = 0;
  ma60PricesIncline = 0;
  ma120PricesIncline = 0;

  ma1Price = null;
  ma5Price = null;
  ma10Price = null;
  ma20Price = null;
  ma60Price = null;
  ma120Price = null;

  bollingerHighBand = [];
  bollingerLowBand = [];
  bollingerHigh = null;
  bollingerLow = null;

  max = null;
  min = null;
  avg = null;
  avg1perDownPrice = null;
  avg2perDownPrice = null;
  avg1perUpPrice = null;

  maState = 'none';
  buyHold = false;
  buyHoldPrice = null;
  buyWaiting = false;
  buyTiming = false;
  installmentBuyTiming = false; // 분할매수 타이밍
  installmentBuyCount = 0; // 분할매수 횟수

  sellHold = false;
  sellHoldPrice = null;
  sellTiming = false;
  installmentSellTiming = false; // 분할매도 타이밍
  installmentSellCount = 0; // 분할매도 횟수

  currentPrice = null; // 가장 최근 거래 값

  buyPrices = [];
  avgBuyPrice = null; // 평단
  constructor(model) {
    this.model = model;
  }

  addTradePrice(currentPrice) {
    this.count++;
    this.currentPrice = currentPrice;
    this.prices.push(currentPrice);
  }

  analyse() {
    // this.max = Math.max(...this.tradePrices);
    // this.min = Math.min(...this.tradePrices);
    this.makeMaPrices();
    this.makeAvgPrices(30);
    this.makeIncline();

    // 매매 타이밍 알고리즘 사용
    if (this.model == 'RBJ1') {
      this.setTradeTimingUseAvg1Per();
    } else if (this.model == 'RBJ2') {
      this.setTradeTimingUseMa1020();
    } else if (this.model == 'RBJ2.1') {
      this.setTradeTimingUseMa5_20();
    } else if (this.model == 'RBJ2.5') {
      this.setTradeTimingUseMaCheck();
    } else {
      this.setTradeTimingUseMa1020();
    }

    return this;
  }

  setTradeTimingUseMa1020() {
    if (this.buyTiming || this.sellTiming) return;

    if (this.maState == 'lower' && this.ma10Price > this.ma20Price) {
      this.buyTiming = true;
    } else if (this.maState == 'upper' && this.ma10Price < this.ma20Price) {
      this.sellTiming = true;
    }

    if (this.ma10Price < this.ma20Price) {
      this.maState = 'lower';
    } else {
      this.maState = 'upper';
    }

    // // 평단 3% 이상이면 욕심버리고 팔기
    // if (this.maState == 'upper' && this.avgBuyPrice * 1.03 < this.currentPrice) {
    //     this.sellTiming = true;
    // }
  }

  setTradeTimingUseMa5_20() {
    if (this.buyTiming || this.sellTiming) return;

    if (this.maState == 'lower' && this.ma5Price > this.ma20Price) {
      this.buyTiming = true;
    } else if (this.maState == 'upper' && this.ma5Price < this.ma20Price) {
      this.sellTiming = true;
    }

    if (this.ma5Price < this.ma20Price) {
      this.maState = 'lower';
    } else {
      this.maState = 'upper';
    }
  }

  setTradeTimingUseMaCheck() {
    if (this.buyTiming || this.sellTiming) return;

    if (this.maState == 'lower' && this.ma10PricesIncline > 0.99999) {
      if (this.ma60PricesIncline > 0.998 && this.ma120PricesIncline > 0.998) {
        this.buyTiming = true;
      }
    } else if (this.maState == 'upper' && this.ma10PricesIncline < 0.998) {
      this.sellTiming = true;
    }

    if (this.maState == 'upper' && this.ma5Price < this.ma20Price) {
      this.sellTiming = true;
    }

    if (this.ma10Price < this.ma20Price) {
      this.maState = 'lower';
    } else {
      this.maState = 'upper';
    }
  }

  setTradeTimingUseAvg1Per() {
    if (this.buyTiming || this.sellTiming) return;

    if (this.ma1Price < this.avg1perDownPrice) {
      if (!this.buyHold) {
        this.buyHold = true;
        console.log('buyHold');
      }
    } else if (this.buyHold && this.ma1Price >= this.avg1perDownPrice) {
      this.buyTiming = true;
      this.buyHold = false;
      this.buyWaiting = false;
      console.log('buyTiming')
    }


    if (this.ma1Price > this.avg1perUpPrice) {
      if (!this.sellHold) { // 홀드상태가 아닌경우에 현재가가 파는 가격보다 올라갔다 -> 홀드
        this.sellHold = true;
        console.log('sellHold')
      } else if (this.ma1Price > this.avg1perUpPrice * 1.03) { // 홀드상태인데 계속 올라서(급등) 팔 가격의 3%를 초과했다 -> 빠른매도
        this.sellTiming = true;
        this.sellHold = false;
        console.log('up 3% sellTiming')
      }
    } else if (this.ma1Price <= this.avg1perUpPrice) {
      if (this.sellHold) { // 홀드상태인데 다시 원상복구 했다 -> 매도
        this.sellTiming = true;
        this.sellHold = false;
        console.log('sellTiming');
      }
    }
  }

  makeMaPrices() {
    this.ma1Price = this.getMaPrice(1);
    this.ma5Price = this.getMaPrice(5);
    this.ma10Price = this.getMaPrice(10);
    this.ma20Price = this.getMaPrice(20);
    this.ma60Price = this.getMaPrice(60);
    this.ma120Price = this.getMaPrice(120);

    this.ma1Prices.push(this.ma1Price);
    this.ma5Prices.push(this.ma5Price);
    this.ma10Prices.push(this.ma10Price);
    this.ma20Prices.push(this.ma20Price);
    this.ma60Prices.push(this.ma60Price);
    this.ma120Prices.push(this.ma120Price);
  }

  getMaPrice(minute) {
    const unit = minute * MINUTE_COUNT;
    if (this.prices.length >= unit) {
      const filteredPrices = this.prices.slice(this.prices.length - unit);
      const sum = filteredPrices.reduce((acc, value) => (acc + value));
      return sum / filteredPrices.length;
    }
    return null;
  }

  makeIncline() {
    this.ma1PricesIncline = this.getIncline(1, this.ma1Prices, this.ma1Price);
    this.ma5PricesIncline = this.getIncline(1, this.ma5Prices, this.ma5Price);
    this.ma10PricesIncline = this.getIncline(1, this.ma10Prices, this.ma10Price);
    this.ma20PricesIncline = this.getIncline(1, this.ma20Prices, this.ma20Price);
    this.ma30PricesIncline = this.getIncline(1, this.ma30Prices, this.ma30Price);
    this.ma60PricesIncline = this.getIncline(1, this.ma60Prices, this.ma60Price);
    this.ma120PricesIncline = this.getIncline(1, this.ma120Prices, this.ma120Price);
  }

  getIncline(minute, maPrices, maPrice) {
    const unit = minute * MINUTE_COUNT;
    if (maPrices.length >= unit) {
      const beforeMaPrice = maPrices[maPrices.length - unit];
      return maPrice / beforeMaPrice;
    }
    return null;
  }

  makeAvgPrices(unit) {
    this.avg = this.getMaPrice(unit);
    this.avg1perDownPrice = this.avg * 0.995;
    this.avg2perDownPrice = this.avg * 0.98;
    this.avg3perDownPrice = this.avg * 0.97;
    this.avg1perUpPrice = this.avg * 1.005;
  }

  pushTotalRecord() {
    // this.totalRecord.max.push(this.max);
    // this.totalRecord.min.push(this.min);
    this.totalRecord.avg.push(this.avg ? Math.round(this.avg * 100) / 100 : null);
    this.totalRecord.ma1Price.push(this.ma1Price ? Math.round(this.ma1Price * 100) / 100 : null);
    this.totalRecord.ma5Price.push(this.ma5Price ? Math.round(this.ma5Price * 100) / 100 : null);
    this.totalRecord.ma10Price.push(this.ma10Price ? Math.round(this.ma10Price * 100) / 100 : null);
    this.totalRecord.ma20Price.push(this.ma20Price ? Math.round(this.ma20Price * 100) / 100 : null);
    this.totalRecord.ma60Price.push(this.ma60Price ? Math.round(this.ma60Price * 100) / 100 : null);
    this.totalRecord.ma120Price.push(this.ma120Price ? Math.round(this.ma120Price * 100) / 100 : null);

    this.totalRecord.ma10PricesIncline.push(this.ma10PricesIncline);

    this.totalRecord.price.push(this.currentPrice);
    this.totalRecord.avgBuyPrice.push(this.avgBuyPrice);
    this.totalRecord.avg1perDownPrice.push(this.avg1perDownPrice);
    this.totalRecord.avg2perDownPrice.push(this.avg2perDownPrice);
    this.totalRecord.avg1perUpPrice.push(this.avg1perUpPrice);
    this.totalRecord.sellTiming.push(this.sellTiming ? this.currentPrice : null);
    this.totalRecord.buyWaiting.push(this.buyWaiting ? this.currentPrice : null);
    this.totalRecord.buyTiming.push(this.buyTiming ? this.currentPrice : null);

    this.totalRecord.time.push(parseInt(new Date().getTime() / 1000));
  }

  pushTestTotalRecord() {
    // this.totalRecord.max.push(this.max);
    // this.totalRecord.min.push(this.min);
    this.totalRecord.avg.push(this.avg ? Math.round(this.avg * 100) / 100 : null);
    this.totalRecord.ma1Price.push(this.ma1Price ? Math.round(this.ma1Price * 100) / 100 : null);
    this.totalRecord.ma5Price.push(this.ma5Price ? Math.round(this.ma5Price * 100) / 100 : null);
    this.totalRecord.ma10Price.push(this.ma10Price ? Math.round(this.ma10Price * 100) / 100 : null);
    this.totalRecord.ma20Price.push(this.ma20Price ? Math.round(this.ma20Price * 100) / 100 : null);
    this.totalRecord.ma60Price.push(this.ma60Price ? Math.round(this.ma60Price * 100) / 100 : null);
    this.totalRecord.ma120Price.push(this.ma120Price ? Math.round(this.ma120Price * 100) / 100 : null);

    this.totalRecord.ma10PricesIncline.push(this.ma10PricesIncline);

    this.totalRecord.price.push(this.currentPrice);
    this.totalRecord.avgBuyPrice.push(this.avgBuyPrice);
    this.totalRecord.avg1perDownPrice.push(this.avg1perDownPrice);
    this.totalRecord.avg2perDownPrice.push(this.avg2perDownPrice);
    this.totalRecord.avg1perUpPrice.push(this.avg1perUpPrice);
    this.totalRecord.sellTiming.push(this.sellTiming ? this.currentPrice : null);
    this.totalRecord.buyWaiting.push(this.buyWaiting ? this.currentPrice : null);
    this.totalRecord.buyTiming.push(this.buyTiming ? this.currentPrice : null);

    const date = new Date();
    date.setTime(date.getTime() + (1000 * this.count));
    this.totalRecord.time.push(parseInt(date.getTime() / 1000));
  }

  getRecord() {
    return {
      price: this.currentPrice,
      sellTiming: this.sellTiming ? this.currentPrice : null,
      buyTiming: this.buyTiming ? this.currentPrice : null,
      avg : this.avg ? Math.round(this.avg * 100) / 100 : null,
      ma1Price : this.ma1Price ? Math.round(this.ma1Price * 100) / 100 : null,
      ma5Price : this.ma5Price ? Math.round(this.ma5Price * 100) / 100 : null,
      ma10Price : this.ma10Price ? Math.round(this.ma10Price * 100) / 100 : null,
      ma20Price : this.ma20Price ? Math.round(this.ma20Price * 100) / 100 : null,
      ma60Price : this.ma60Price ? Math.round(this.ma60Price * 100) / 100 : null,
      ma120Price : this.ma120Price ? Math.round(this.ma120Price * 100) / 100 : null,
      time : parseInt(new Date().getTime() / 1000)
    }
  }
}
