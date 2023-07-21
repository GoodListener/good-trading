module.exports = class TestDataHanlder{
    constructor(testData) {
        this.testData = testData;
        this.count = 0;
    }

    handle() {
        return this.testData[this.count++];
    }

    next() {
        if (this.testData.length <= this.count) {
            return false;
        }
        return true;
    }
}