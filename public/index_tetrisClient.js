const staticStyle = require('./style/staticStyle.css');
const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const control = require('./tetrisClient/control.js');
const draw = require('./tetrisClient/draw.js');

// generate HTML elements for tetris gameplay and start match setup
window.onload = () => {
    // setup HTML elements for gameplay
    let body = document.getElementsByTagName("body")[0];

    const mainBoard = draw.newPlayfieldCanvas(1000, 2000, '25vh', 'mainBoard', body);

    // give socketIO time to connect before rendering anything
    socket.on('connect', () => {
        control.setup(mainBoard);
    });
};