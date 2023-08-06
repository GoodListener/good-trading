export default class Statement {
  record = [];
  constructor() {

  }

  ask(price) {
    this.record.push({trade: 'ask', price: price, date: new Date().toLocaleString()});
  }

  bid(price) {
    this.record.push({trade: 'bid', price: price, date: new Date().toLocaleString()});
  }
}