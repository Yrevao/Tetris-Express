const utils = require("./utils.js");
const { io } = require("socket.io-client");
const url = new URL(window.location);
let socketSession = null;
export let username = null;
export let isHost = false;
export let id = null;
export let match = null;

export const init = async (socket) => {
    socketSession = socket;
    id = socket.id;

    // check if the url is joining a match, if not create one
    if(url.pathname == '/join' && url.searchParams.get('match') != null)
        match = url.searchParams.get('match');
    else {
        match = socket.id;
        url.pathname = 'join';
        url.searchParams.set('match', match);

        window.history.pushState(null, '', url.toString());
    }

    await utils.request({ method: 'username' }, url.origin + '/utils')
        .then(data => {
            username = data.name;
        });

    await utils.request({ player: socketSession.id, username: username }, url.toString())
        .then(data => {
            if(data.isHost)
                becomeHost();
            socketSession.emit('joinSocket');
        });
}

// request a new bag of 7 shuffled pieces from the server
export const requestBag = () => {
    return new Promise((resolve, reject) => {
        utils.request({ player: socketSession.id }, url.origin + '/bag')
            .then(data => {
                if(!data.error)
                    resolve(data.bag);
                else
                    reject('Error requesting bag');
            });
    });
}

// update the server with the state of the game in play
export const stateUpdate = (board, lost) => {
    utils.request({ player: socketSession.id, board: board, lost: lost, flag: 'match' }, url.origin + '/update');
}

export const usernameUpdate = (newUsername) => {
    username = newUsername;
    utils.request({ player: socketSession.id, username: newUsername, flag: 'username' }, url.origin + '/update');
}

export const bindEvent = (eventName, method) => {
    socketSession.on(eventName, method);
}

export const becomeHost = () => {
    isHost = true;
}