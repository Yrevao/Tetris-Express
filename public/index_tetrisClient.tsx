const staticStyle = require('./style/staticStyle.css');
import * as socketIO from 'socket.io-client';
const socket = socketIO.io(window.location.origin);
import * as game from './tetrisClient/modules/game.tsx';
import * as lobby from './tetrisClient/modules/lobby.tsx';
import * as session from './tetrisClient/modules/session.tsx';

// set SocketIO event methods
let setEvents = (session: any) => {
    session.bindEvent('update', lobby.events.update);
    session.bindEvent('start', lobby.events.start);
    session.bindEvent('pause', lobby.events.pause);
    session.bindEvent('reset', lobby.events.end);

    // this is a single use method
    setEvents = () => {};
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