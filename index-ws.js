const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(3000, function () { console.log(`Listening on 3000`); });

process.on('SIGINT', () => {
    console.log('sigint');
    wss.clients.forEach(function each(client) {
        client.close;
    })
    server.close(() => {
        shutdownDB();
    })
});

/** Begin websocket **/

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {
    // when someone connects to a server, log it
    const numClients = wss.clients.size;
    
    console.log('clients connected: ', numClients);

    // broadcast sends everyone a message at once
    wss.broadcast(`current visitors: ${numClients}`);

    // when connection opens
    if (ws.readyState === ws.OPEN) {
        ws.send('welcome to my server');
    }

    db.run(`INSERT INTO visitors (count, time)
            VALUES (${numClients}, datetime('now'))`)

    // when connection closes
    ws.on('close', function close() {
        wss.broadcast(`Current visitors: ${numClients}`);
        console.log('a client has disconnected');
    })
});

// broadcast function to send each client the data
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    })
}

/** end websockets */
/** begin database */

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

// makes sure your database is up before trying to use it
db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

// close connection to your database
function shutdownDB() {
    getCounts();
    console.log('shutting down db');
    db.close();
}