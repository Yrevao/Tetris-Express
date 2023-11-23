const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const settings = require('./settings.js');

app.use(express.json());
const routes = require('./lib/routes.js')(app, io);

server.listen(settings.port);