'use strict';

module.exports = {
    run: run,
    initiate: initiate
};

const net = require('net'),
    Server = require('./Server');

function run(host, port) {
    const client = initiate(host, port);
    client.on('data', function(data) {
        console.log(data.toString());
    });

    return client; 
}

function initiate(host, port) {

    const client = new net.Socket();

    client.connect(port, host);

    client.once('data', function(data) {
        const initialMessage = data.toString();

        if (initialMessage.indexOf(Server.GREETING_BLOCKED) == 0) {
            console.error('!!! Client blocked, server does not allow connections from this host');
            process.exit();
        }
        else if (data.toString().indexOf(Server.GREETING_HELLO) != 0) {
            console.error('!!! Unexpected hello greeting from server');
            process.exit();
        }
    });

    return client; 
}
