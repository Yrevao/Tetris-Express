const path = require('path');
const express = require('express');

module.exports = (app, io) => {
    app.use(express.static(path.join(__dirname, '../dist')));
}