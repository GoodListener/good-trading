const request = require('request');

function getAccount(token) {
    const options = {
        method: "GET",
        url: `${process.env.UPBIT_API_URL}/v1/accounts`,
        headers: {Authorization: `${token}`},
    }
    
    return new Promise(res => {
        request(options, (error, response, body) => {
            if (error) throw new Error(error)
            res(JSON.parse(body));
        })
    })
}

module.exports = {
    getAccount
}