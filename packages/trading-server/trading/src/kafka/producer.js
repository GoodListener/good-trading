const kafka = require('kafka-node');
const Producer = kafka.Producer;
const KeyedMessage = kafka.KeyedMessage;
const client = new kafka.KafkaClient();
const producer = new Producer(client);

const state = {
    topic: 'topic1',
    enable: false
}

function init(topic) {
    state.topic = topic;
    console.log(state.topic);
    producer.on('ready', function () {
        state.enable = true
    });
}

function sendMessage(key, message) {
    if (!state.enable) {
        console.log('disabled');
        return; 
    }
    
    const keyedMessage = new KeyedMessage(key, message);
    const payloads = [{ topic: 'power2', messages: keyedMessage }];

    producer.send(payloads, function (err, data) {
        console.log(data);
    });
}

module.exports = {
    init,
    sendMessage
}