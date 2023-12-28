const utils = require("./utils.js");
const { io } = require("socket.io-client");
let socketSession = null;
const url = new URL(window.location);
export let id = null;
export let match = null;

export const init = async (socket) => {
    socketSession = socket;
    id = socket.id;

    // check if the url is joining a match, if not create one
    if(url.pathname == '/join' && url.searchParams.get('match') != null)
        match = url.searchParams.get('match');
    else {
        url.pathname = 'join';
        url.searchParams.set('match', socket.id);

        window.history.pushState(null, '', url.toString());
    }

    await utils.request({ player: socketSession.id }, url.toString())
        .then(data => {
            if(data.status == 'ok')
                socketSession.emit('joinSocket');
        });
}

// request a new bag of 7 shuffled pieces from the server
export const requestBag = () => {
    return new Promise((resolve, reject) => {
        utils.request({ player: socketSession.id }, window.location.origin + '/bag')
            .then(data => {
                if(!data.error)
                    resolve(data.bag);
                else
                    reject('Error requesting bag');
            });
    });
}

// update the server with the state of the game in play
export const stateUpdate = (board) => {
    utils.request({ player: socketSession.id, board: board }, window.location.origin + '/update');
}

export const bindEvent = (eventName, method) => {
    socketSession.on(eventName, method);
}