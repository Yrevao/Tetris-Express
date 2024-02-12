import * as gameUtils from './gameUtils.ts';
import * as utils from './utils.ts';
import * as draw from './draw.ts';
import * as loop from './loop.ts';
import * as input from'./input.ts';
import * as settings from './settings.ts';
// shared objects
let session: any = null;
let game: any = null;
// page separation
let divs: any = {
    rootDiv: null,
    controlsDiv: null,
    boardsDiv: null,
}
// other players
let opponentState: any = {
    opponents: {},
    canvases: {},
    boards: {},
    users: {},
}

// remove board when a player leaves
const leave = (playerId: string) => {
    let opponent: HTMLElement | null = document.getElementById(`opponent-${playerId}`);
    
    if(!opponent)
        return;
    
    opponent.remove();

    delete opponentState.opponents[playerId];
    delete opponentState.canvases[playerId];
    delete opponentState.boards[playerId];
    delete opponentState.users[playerId];
}

// method run during each game tick
const tickMethod = () => {
    input.checkKeys();
    game.tick();

    const views: any[] = game.getViews().concat(getViews());
    draw.updateViews(views);
}

// when another player joins add a board
const join = (playerId: string, username: string) => {
    let opponentDiv: HTMLDivElement = document.createElement('div');
    divs.boardsDiv.appendChild(opponentDiv);
    opponentDiv.id = `opponent-${playerId}`;

    let nameplate: HTMLDivElement = document.createElement('div');
    nameplate.id = `nameplate-${playerId}`;
    nameplate.textContent = username;
    opponentDiv.appendChild(nameplate);

    opponentState.canvases[playerId] = draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, opponentDiv);
    opponentState.users[playerId] = username;
    opponentState.opponents[playerId] = opponentDiv;

    // keep boards in alphabetical order
    let opponentArr: string[] = Object.keys(opponentState.opponents);
    opponentArr.sort((a, b) => {
        return a.localeCompare(b, "en");
    });
    opponentArr.forEach((id, i) => {
        opponentState.opponents[id].style.order = i;
    })
}

// update the displayed stats when another player places a piece or changes username
const update = (playerId: string, board: gameUtils.Grid, username: string) => {
    opponentState.boards[playerId] = board;

    // update username if it's been changed
    if(username != null && opponentState.users[playerId] != null && opponentState.users[playerId] != username) {
        let nameplate = document.getElementById(`nameplate-${playerId}`);
        if(nameplate)
            nameplate.textContent = username;

        opponentState.users[playerId] = username;
    }

    if(!Object.keys(opponentState.canvases).includes(playerId))
        join(playerId, username);
}

// start the match
const startMatchButton = () => {
    session.controlFlow(settings.exportSettings());
}

// pause match
const pauseMatchButton = () => {
    session.controlFlow();
}

// give player host UI elements (start/end button)
const setHostUi = () => {
    // start and pause button
    utils.newButton('New Game', startMatchButton, 'startbutton', divs.controlsDiv);
    utils.newButton('Pause', pauseMatchButton, 'pauseButton', divs.controlsDiv);
}

// place universal ui elements
const initUI = (players: any) => {
    divs.boardsDiv.innerHTML = '';
    divs.controlsDiv.innerHTML = '';

    // place host ui elements
    if(session.isHost)
        setHostUi();

    settings.init(session);

    utils.newButton('Settings', settings.openSettings, 'settingsButton', divs.controlsDiv);

    // place all opponent boards
    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const player: any = players[playerId];
        const board: any = player.board.length == 0 ? gameUtils.newGrid(10, 40) : player.board;
        update(playerId, board, player.username);
    }
}

// when you are the only player left in a match you become the host
const becomeHost = () => {
    session.becomeHost();
    setHostUi();
}

// set settings methods
const setSettingBinds = () => {
    settings.bindSetting('before', events.settingClearBinds, false);
    settings.bindSetting('usernameSetting', events.settingUsername, false);
    settings.bindSetting('autorepeatDelay', events.settingRolloverDelay, false);
    settings.bindSetting('autorepeatSpeed', events.settingRolloverSpeed, false);

    settings.bindSetting('moveLeft', (key) => input.bindKey(key, game.events.left, true), true);
    settings.bindSetting('moveRight', (key) => input.bindKey(key, game.events.right, true), true);
    settings.bindSetting('rotLeft', (key) => input.bindKey(key, game.events.rotLeft, false), true);
    settings.bindSetting('rotRight', (key) => input.bindKey(key, game.events.rotRight, false), true);
    settings.bindSetting('rot180', (key) => input.bindKey(key, game.events.rot180, false), true);
    settings.bindSetting('softDrop', (key) => input.bindKey(key, game.events.softDrop, false), true);
    settings.bindSetting('hardDrop', (key) => input.bindKey(key, game.events.hardDrop, false), true);
    settings.bindSetting('hold', (key) => input.bindKey(key, game.events.hold, false), true);
}

export const events = {
    update: (data: any) => {
        // update the opponent boards only if the update is for another player
        if(data.player == session.id) {
            if(data.lost)
                loop.stop();
            return;
        }

        switch(data.flag) {
            case 'init':
                loop.stop();
                initUI(data.players);
                break;
            case 'update':
                update(data.player, data.board, data.username);
                break;
            case 'join':
                join(data.player, data.username);
                break;
            case 'leave':
                leave(data.player);
                break;
            case 'giveHost':
                becomeHost();
                break;
        }
    },
    start: async (data: any) => {
        // start match
        await game.start(
            settings.applySettings(data)
        );
        loop.start(1000, tickMethod);
    },
    pause: (data: any) => {
        game.pause(data.paused);

        if(data.paused)
            loop.stop();
        else
            loop.restart();
    },
    end: (data: any) => {
        game.pause(true);
        loop.stop();
    },
    settingClearBinds: () => {
        input.clearBinds();
    },
    settingUsername: (name: string) => {
        session.usernameUpdate(name);
        game.updateUsername(name);
    },
    settingRolloverDelay: (delay: number) => {
        input.setRollover(delay, undefined);
    },
    settingRolloverSpeed: (speed: number) => {
        input.setRollover(undefined, speed);
    }
}

export const init = (initSession: any, initGame: any) => {
    session = initSession;
    game = initGame;
    setSettingBinds();

    // setup gui elements
    if(divs.boardsDiv && divs.controlsDiv) {
        divs.boardsDiv.remove();
        divs.controlsDiv.remove();
    } 

    divs.rootDiv = document.getElementById('root');
    let bodyDiv: HTMLBodyElement = document.getElementsByTagName('body')[0];

    divs.boardsDiv = document.createElement('div');
    divs.boardsDiv.id = 'boards';

    divs.controlsDiv = document.createElement('div');
    divs.controlsDiv.id = 'controls';

    bodyDiv.appendChild(divs.boardsDiv);
    divs.rootDiv.appendChild(divs.controlsDiv);
}

export const getViews = (): draw.View[] => {
    let views: draw.View[] = [];

    for(let id in opponentState.boards)
        views.push(draw.newView(10, 20, 0, 20, opponentState.boards[id], opponentState.canvases[id]));

    return views;
}