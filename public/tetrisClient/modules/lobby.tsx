import * as gameUtils from './gameUtils.tsx';
import * as utils from './utils.tsx';
import * as draw from './drawUtils.tsx';
import * as loop from './loop.tsx';
import * as input from'./input.tsx';
import * as settings from './settings.tsx';
// shared objects
let session: any = null;
let game: any = null;

// for displaying opponent's boards
let opponentState: Map<string, HTMLDivElement> = new Map();
let canvasState: Map<string, HTMLCanvasElement> = new Map();
let boardState: Map<string, gameUtils.Grid> = new Map();
let userState: Map<string, string> = new Map();

// remove board when a player leaves
const leave = (playerId: string) => {
    let opponent: HTMLElement | null = document.getElementById(`opponent-${playerId}`);
    
    if(!opponent)
        return;
    
    opponent.remove();

    opponentState.delete(playerId);
    canvasState.delete(playerId);
    boardState.delete(playerId);
    userState.delete(playerId);
}

// method run during each game tick
const tickMethod = () => {
    input.checkKeys();
    game.tick();

    const views: draw.View[] = game.getViews().concat(getViews());
    draw.updateViews(views);
}

// when another player joins add a board
const join = (playerId: string, username: string) => {
    // null checks
    let boardsDiv: HTMLElement | null = document.getElementById('boards');
    if(!boardsDiv)
        return;

    // create html elements for new opponenet
    let opponentDiv: HTMLDivElement = document.createElement('div');
    boardsDiv.appendChild(opponentDiv);
    opponentDiv.id = `opponent-${playerId}`;

    let nameplate: HTMLDivElement = document.createElement('div');
    nameplate.id = `nameplate-${playerId}`;
    nameplate.textContent = username;
    opponentDiv.appendChild(nameplate);

    canvasState.set(playerId, draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, opponentDiv));
    userState.set(playerId, username);
    opponentState.set(playerId, opponentDiv);

    // keep boards in alphabetical order
    let opponentArr: string[] = Array.from(opponentState.keys());
    opponentArr.sort((a, b) => {
        return a.localeCompare(b, "en");
    });
    opponentArr.forEach((id, i) => {
        let curDiv: HTMLDivElement | undefined = opponentState.get(id);
        if(!curDiv)
            return;

        curDiv.style.order = i.toString();
        opponentState.set(id, curDiv);
    })
}

// update the displayed stats when another player places a piece or changes username
const update = (playerId: string, board: gameUtils.Grid, username: string) => {
    boardState.set(playerId, board);

    // update username if it's been changed
    if(username != null && userState.get(playerId) != null && userState.get(playerId) != username) {
        let nameplate = document.getElementById(`nameplate-${playerId}`);
        if(nameplate)
            nameplate.textContent = username;

        userState.set(playerId, username);
    }

    if(!Array.from(canvasState.keys()).includes(playerId))
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
    // null checks
    let controlsDiv: HTMLElement | null = document.getElementById('controls');
    if(!controlsDiv)
        return;

    // start and pause buttons
    utils.newButton('New Game', startMatchButton, 'startbutton', controlsDiv);
    utils.newButton('Pause', pauseMatchButton, 'pauseButton', controlsDiv);
}

// place universal ui elements
const initUI = (players: any) => {
    // null checks
    let controlsDiv: HTMLElement | null = document.getElementById('controls');
    if(!controlsDiv)
        return;

    // clear UI buttons
    controlsDiv.innerHTML = '';

    // place host ui elements
    if(session.isHost)
        setHostUi();

    settings.init(session);

    utils.newButton('Settings', settings.openSettings, 'settingsButton', controlsDiv);

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
    settings.refreshSettingsUI();
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
    start: async (remoteSettings: any) => {
        // start match
        await game.start(
            settings.applySettings(remoteSettings)
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
    let boardsDiv: HTMLElement | null = document.getElementById('boards');
    let controlsDiv: HTMLElement | null = document.getElementById('controls');
    if(boardsDiv && controlsDiv) {
        boardsDiv.remove();
        controlsDiv.remove();
    } 

    // null checks
    let rootDiv: HTMLElement | null = document.getElementById('root');
    if(!rootDiv) {
        rootDiv = document.createElement('div');
        rootDiv.id = 'root';
        document.body.appendChild(rootDiv);
    }

    boardsDiv = document.createElement('div');
    boardsDiv.id = 'boards';

    controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';

    document.body.appendChild(boardsDiv);
    rootDiv.appendChild(controlsDiv);
}

export const getViews = (): draw.View[] => {
    let views: draw.View[] = [];

    // generate views for opponent boards
    for(let id of boardState.keys()) {
        let board: gameUtils.Grid | undefined = boardState.get(id);
        let canvas: HTMLCanvasElement | undefined = canvasState.get(id);
        if(!board || !canvas)
            continue;

        views.push(draw.newView(10, 20, 0, 20, board, canvas));
    }

    return views;
}