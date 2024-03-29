import * as utils from "./utils.ts";
import * as gameUtils from "./gameUtils.ts";
const url: URL = new URL(window.location.href);
let socketSession: any = null;
export let username: string | null = 'none';
export let isHost: boolean = false;
export let id: string | null = 'none';
export let match: string | null = 'none';

// request a new username to be generated on the server
export const getNewUsername = (): Promise<string> => {
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
        .then((data: string) => {
            username = data;
        });

    await utils.request({ player: socketSession.id, username: username, match: match }, url.toString())
        .then((data: any) => {
            if(data.isHost)
                becomeHost();
            socketSession.emit('joinSocket');
        });
}

// request a new bag of 7 shuffled pieces from the server
export const requestBag = (): Promise<number[]> => {
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
export const stateUpdate = (board: gameUtils.Grid, lost: boolean) => {
    utils.request({ player: socketSession.id, board: board, lost: lost, flag: 'match' }, url.origin + '/update');
}

// update server with current player username
export const usernameUpdate = (newUsername: string) => {
    username = newUsername;
    utils.request({ player: socketSession.id, username: newUsername, flag: 'username' }, url.origin + '/update');
}

// set a SocketIO socket event to a method
export const bindEvent = (eventName: string, method: Function) => {
    socketSession.on(eventName, method);
}

// set the host flag to true, host flag determines which UI elements are used
export const becomeHost = () => {
    isHost = true;
}

// start the match with settings and pause/unpause the match
export const controlFlow = (settings?: any | undefined) => {
    if(!isHost)
        return;

    if(settings)
        utils.request({ player: id, settings: settings }, window.location.origin + '/start');
    else
        utils.request({ player: id }, window.location.origin + '/pause');
}