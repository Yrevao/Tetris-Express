const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const staticStyle = require('./style/staticStyle.css');
const model = require('./tetrisClient/model.js');
const draw = require('./tetrisClient/draw.js');

window.onload = () => {
    let body = document.getElementsByTagName("body")[0];

    const mainBoard = draw.newPlayfieldCanvas(1000, 2000, '25vh', 'mainBoard', body);

    // give socketIO time to connect before rendering anything
    socket.on('connect', () => {
        model.startClient(mainBoard);
    });
};