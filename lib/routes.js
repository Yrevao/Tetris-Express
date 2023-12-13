const express = require('express');
const control = require('./control');

module.exports = (app, io) => {
    app.use(express.static('dist'));
    app.get('/', control.tetrisClient.init);
}