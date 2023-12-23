const express = require('express');
const controllers = require('./controllers');

module.exports = (app, io) => {
    // webpacked javascripts
    app.use(express.static('dist'));

    // rendered tetris client html
    app.get('/', controllers.tetrisClient.init);

    // tetris gameplay synchronization
    app.post('/join', controllers.tetrisClient.join);
    app.post('/bag', controllers.tetrisClient.nextBag);
    app.post('/state', (req, res) => {
        controllers.tetrisClient.updateState(req, res, io);
    });


    // SocketIO routes
    io.on('connection', (socket) => {
        socket.on('joinSocket', () => {
            controllers.tetrisClient.joinSocket(socket);
        });
    })
}