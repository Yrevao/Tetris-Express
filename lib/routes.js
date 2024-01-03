const express = require('express');
const controllers = require('./controllers');

module.exports = (app, io) => {
    // webpacked javascripts
    app.use(express.static('dist'));

    // rendered tetris client html
    app.get('/', controllers.tetrisClient.init);
    app.get('/join', controllers.tetrisClient.init);

    // tetris gameplay synchronization
    app.post('/join', controllers.tetrisClient.join);
    app.post('/bag', controllers.tetrisClient.nextBag);
    app.post('/update', (req, res) => {
        controllers.tetrisClient.updateState(req, res, io);
    });
    app.post('/start', (req, res) => {
        controllers.tetrisClient.startMatch(req, res, io);
    });

    // utils
    app.post('/utils', (req, res) => {
        switch(req.body.method) {
            case 'username':
                controllers.utils.generateUsername(req, res);
        }
    })

    // SocketIO routes
    io.on('connection', (socket) => {
        socket.on('joinSocket', () => {
            controllers.tetrisClient.joinSocket(socket, io);
        });

        socket.on('disconnect', () => {
            controllers.tetrisClient.leave(socket, io);
        });
    })
}