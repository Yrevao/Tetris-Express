const staticStyle = require('./style/staticStyle.css');
const { io } = require("socket.io-client");
const socket = io(window.location.origin);
const game = require('./tetrisClient/game.js');
const lobby = require('./tetrisClient/lobby.js');
const session = require('./tetrisClient/session.js');

// set SocketIO event methods
const setEvents = (session) => {
    session.bindEvent('update', lobby.events.update);
    session.bindEvent('start', lobby.events.start);
}

// generate HTML elements for tetris gameplay and start match setup
window.onload = async () => {
    // initalize gameplay objects
    game.init(session);
    lobby.init(session, game);

    // give socketIO time to connect before starting anything
    socket.on('connect', async () => {
        // reset gameplay objects
        await session.init(socket);
        setEvents(session);
    });
};