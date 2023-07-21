module.exports = class TestDataGenerator{
    constructor(option) {
        this.price = option.initialPrice? option.initialPrice : 300;
        this.strength = option.strength ? option.strength : [1];
    }

    generate(count) {
        const testData = [];
        let i = 0;

        while (i < count) {
            let strengthIndex = parseInt(i / (count / this.strength.length));
            this.price *= 1 + (Math.random() * this.strength[strengthIndex] * 2 - this.strength[strengthIndex]) / 100;
            testData.push(this.price.toFixed(3));
            i++;
        }
        return testData;
    }
}