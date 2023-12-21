const utils = require("./utils.js");
const { io } = require("socket.io-client");
let socketSession = null;

export const init = (socket) => {
    socketSession = socket;
}

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