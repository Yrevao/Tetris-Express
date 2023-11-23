const { io } = require("socket.io-client");
const socket = io(window.location.origin);
import * as tetris from './modelTetris.js';
import staticStyle from './style/style.css';

const init = () => {
    let body = document.getElementsByTagName("body")[0];

    // canvas dom node
    const board = document.createElement('canvas');
    board.id = 'board';
    board.width = '1000';
    board.height = '2000';
    board.style = 'height: 50vh;';
    body.appendChild(board);

    // give socketIO time to connect before rendering anything
        socket.on('connect', () => {
        tetris.blockFall();
    });
};

init();