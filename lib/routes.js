const express = require('express');
const render = require ('./render.js');

module.exports = (app, io) => {
    app.get('/', (req, res) => {
        res.send(render.tetrisClient());
    })
}