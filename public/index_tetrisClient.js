const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const staticStyle = require('./style/staticStyle.css');
const setup = require('./tetrisClient/setup.js');
const draw = require('./tetrisClient/draw.js');
const session = require('./tetrisClient/session.js');

// generate HTML elements for tetris gameplay and start match setup
window.onload = () => {
    // setup HTML elements for gameplay
    let root = document.getElementById('root');

    const holdCanvas = draw.newPlayfieldCanvas(400, 200, '4vh', 'holdCanvas', root);
    const boardCanvas = draw.newPlayfieldCanvas(1000, 2000, '40vh', 'boardCanvas', root);
    const nextCanvas = draw.newPlayfieldCanvas(400, 1400, '28vh', 'holdCanvas', root);

    // give socketIO time to connect before rendering anything
    socket.on('connect', async () => {
        await session.init(socket);

        setup.start(session, boardCanvas, holdCanvas, nextCanvas);
    });
};