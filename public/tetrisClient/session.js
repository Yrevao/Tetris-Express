const utils = require("./utils.js");
const { io } = require("socket.io-client");
let socketSession = null;

export const init = async (socket) => {
    socketSession = socket;

    await utils.request({ player: socketSession.id }, window.location.origin + '/join?match=game')
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
                if(!data.error) {
                    resolve(data.bag);
                }
                else {
                    reject('Error requesting bag');
                }
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