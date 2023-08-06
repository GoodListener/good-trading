const fetch = require("node-fetch");

function getAllMarkets(token) {
    let url = `${process.env.UPBIT_API_URL}/v1/market/all`;

    let options = {method: 'GET', qs: {isDetails: 'false'}};

    return fetch(url, options)
    .then(res => res.json())
    .catch(err => console.error('error:' + err));
}

function getTicker(codes) {
    let url = `${process.env.UPBIT_API_URL}/v1/ticker?markets=${codes}`;
    let options = {method: 'GET'};

    return fetch(url, options)
    .then(res => res.json());
}

module.exports = {
    getAllMarkets,
    getTicker
}