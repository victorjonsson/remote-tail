'use strict';

const exp = module.exports = {
    run: run,
    GREETING_HELLO: 'remote-tail>>>',
    GREETING_BLOCKED: 'remote-tail-client-blocked>>>'
};

const Tail = require('tail').Tail,
    net = require('net'),
    fs = require('fs'),
    util = require('util'),
    ObjectBag = require('./ObjectBag'),
    socketsBag = new ObjectBag(),
    history = [],
    maxHistorySize = 500; // Number of lines to store in history


function run(fileToBeTailed, host, port, allowedClientHosts) {

    addFileDataToHistory(fileToBeTailed);

    new Tail(fileToBeTailed)
            .on('line', handleNewLogLine)
            .on('error', handleTailError);

    net.createServer(function(socket) {
        handleNewConnection(socket, allowedClientHosts);
    })
    .listen(port, host);

    console.log('Started server on %s and port %s', host, port);
}


function addToHistory(data) {
    history.push(data);
    if (history.length > maxHistorySize) {
        history.splice(0,1);
    }
}

function getLatestHistory() {
    return history.join("\n");
}

function addFileDataToHistory(filePath) {

    const fileSize = fs.statSync(filePath).size,
        file = fs.openSync(filePath, 'r+');

    let bufferSize = 102400,
        readStartingPosition;
    if (fileSize < bufferSize) {
        bufferSize = fileSize;
        readStartingPosition = 0;
    } else {
        readStartingPosition = fileSize - bufferSize;
    }

    const buffer = new Buffer(bufferSize);
    fs.readSync(file, buffer, 0, bufferSize, readStartingPosition);

    history.push.apply(history, buffer.toString('utf-8').split("\n"));
    if (history.length > maxHistorySize) {
        history.splice(0, history.length - maxHistorySize);
    }
}

function handleNewLogLine(line) {
    addToHistory(line);
    socketsBag.each(function(socket) {
        socket.write(line, 'utf-8');
    });
}

function handleTailError(err) {
    throw new Error(err);
}

function handleNewConnection(socket, allowedClientHosts) {
    const clientHost = socket.address().address;
    if (!clientAllowed(clientHost, allowedClientHosts)) {
        socket.write(exp.GREETING_BLOCKED);
        socket.destroy();
        console.log('* Client connection from '+clientHost+' blocked');
    } else {
        socketsBag.save(socket);

        socket.setNoDelay(true);
        socket.setKeepAlive(true, 1);

        socket.write(exp.GREETING_HELLO);
        socket.write(getLatestHistory(), 'utf-8');

        console.log('* New connection established (num connections: '+socketsBag.size()+')');

        socket.on('close', function() {
            socketsBag.remove(socket);
            console.log('* Lost connection (num connections: '+socketsBag.size()+')');
        });
    }
}

function clientAllowed(clientHost, allowedHosts) {
    console.log(allowedHosts);
    if (allowedHosts.length == 0) {
        return true;
    }

    let allowed = false;

    allowedHosts.forEach(function(allowedHost) {
        allowedHost = allowedHost.trim();
        if (
            clientHost == allowedHost ||
            (allowedHost.substr(-1) == '*' && ipAddressIsWithinGivenIpSeries(clientHost, allowedHost))
        ) {
            allowed = true;
            return false;
        }
    });

    return allowed;
}

function ipAddressIsWithinGivenIpSeries(ip, ipSeries) {
    return ip.indexOf(ipSeries.substr(0, ipSeries.indexOf('*'))) == 0;
}