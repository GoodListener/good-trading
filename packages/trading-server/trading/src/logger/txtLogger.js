const fs = require('fs');
const state = require('../state/state');

function log(data, logName) {
    fs.writeFile(`./log/${state.market}${logName ? '-' + logName : ''}.json`, data, function (err) {
        if (err) return console.log(err);
    });
}

module.exports = {
    log
}