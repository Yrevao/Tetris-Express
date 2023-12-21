const express = require('express');
const controllers = require('./controllers');

module.exports = (app, io) => {
    // webpacked javascripts
    app.use(express.static('dist'));

    // rendered tetris client html
    app.get('/', controllers.tetrisClient.init);

    app.post('/bag', controllers.tetrisClient.nextBag);

    // socket io routes
    io.on('connection', (socket) => {
    })
}