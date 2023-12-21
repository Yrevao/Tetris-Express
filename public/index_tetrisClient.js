const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const staticStyle = require('./style/staticStyle.css');
const setup = require('./tetrisClient/setup.js');
const draw = require('./tetrisClient/draw.js');
const session = require('./tetrisClient/session.js');

// generate HTML elements for tetris gameplay and start match setup
window.onload = () => {
    // setup HTML elements for gameplay
    let body = document.getElementsByTagName("body")[0];

    const mainBoard = draw.newPlayfieldCanvas(1000, 2000, '25vh', 'mainBoard', body);

    // give socketIO time to connect before rendering anything
    socket.on('connect', () => {
        session.init(socket);

        setup.start(session, mainBoard);
    });
};