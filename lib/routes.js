const express = require('express');
const controllers = require('./controllers');

module.exports = (app, io) => {
    app.use(express.static('dist'));

    app.get('/', controllers.tetrisClient.init);
}