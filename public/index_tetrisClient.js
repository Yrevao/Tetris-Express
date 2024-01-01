const staticStyle = require('./style/staticStyle.css');
const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const game = require('./tetrisClient/game.js');
const lobby = require('./tetrisClient/lobby.js');
const input = require('./tetrisClient/input.js');
const loop = require('./tetrisClient/loop.js');
const session = require('./tetrisClient/session.js');

// set keybindings
const setBinds = () => {
    input.bindKey('ArrowLeft', game.events.left, true);
    input.bindKey('ArrowRight', game.events.right, true);
    input.bindKey('z', game.events.rotLeft, false);
    input.bindKey('ArrowUp', game.events.rotRight, false);
    input.bindKey('a', game.events.rot180, false);
    input.bindKey('ArrowDown', game.events.softDrop, false);
    input.bindKey(' ', game.events.hardDrop, false);
    input.bindKey('c', game.events.hold, false);
}

// set SocketIO event methods
const setEvents = (session) => {
    session.bindEvent('update', lobby.events.update);
    session.bindEvent('update', loop.events.update);
}

// generate HTML elements for tetris gameplay and start match setup
window.onload = async () => {
    // initalize gameplay objects
    lobby.init(session);
    game.init(session);
    loop.init(lobby, game, input, session);

    // give socketIO time to connect before starting anything
    socket.on('connect', async () => {
        // reset gameplay objects
        await session.init(socket);
        await game.start();
        setEvents(session);

        input.init(167, 33);
        setBinds();

        loop.startLoop(1000)
    });
};