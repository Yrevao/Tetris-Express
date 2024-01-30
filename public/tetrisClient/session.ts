import * as utils from "./utils.ts";
import { io } from "socket.io-client";
const url = new URL(window.location.origin);
let socketSession: any | null = null;
export let username: string | null = 'none';
export let isHost: boolean = false;
export let id: string | null = 'none';
export let match: string | null = 'none';

export const getNewUsername = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        utils.request({ method: 'username' }, url.origin + '/utils')
            .then(data => {
                if(!data.error)
                    resolve(data.name);
                else
                    reject('Error requesting new username');
            });
    });
}

export const init = async (socket: any) => {
    socketSession = socket;
    id = socket.id;

    // null checks
    if(!socketSession || !id)
        return;

    // check if the url is joining a match, if not create one
    if(url.pathname == '/join' && url.searchParams.get('match') != null)
        match = url.searchParams.get('match');
    else {
        match = socket.id;
        if(!match)
            return;

        url.pathname = 'join';
        url.searchParams.set('match', match);

        window.history.pushState(null, '', url.toString());
    }

    await getNewUsername()
        .then((data: any) => {
            username = data;
        });

    await utils.request({ player: socketSession.id, username: username }, url.toString())
        .then((data: any) => {
            if(data.isHost)
                becomeHost();
            socketSession.emit('joinSocket');
        });
}

// request a new bag of 7 shuffled pieces from the server
export const requestBag = (): Promise<any> => {
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