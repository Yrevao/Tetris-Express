// modules
const gameUtils = require('./gameUtils');
const utils = require('./utils');
const draw = require('./draw');
const loop = require('./loop.js');
const input = require('./input.js');
const settings = require('./settings.js');
// shared objects
let session = null;
let game = null;
// page separation
let divs = {
    rootDiv: null,
    controlsDiv: null,
    boardsDiv: null,
}
// other players
let opponentState = {
    opponents: {},
    canvases: {},
    boards: {},
    users: {},
}

// remove board when a player leaves
const leave = (playerId) => {
    let opponent = document.getElementById(`opponent-${playerId}`);
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

    const views = game.getViews().concat(getViews());
    gameUtils.updateViews(views);
}

// when another player joins add a board
const join = (playerId, username) => {
    let opponentDiv = document.createElement('div');
    divs.boardsDiv.appendChild(opponentDiv);
    opponentDiv.id = `opponent-${playerId}`;

    let nameplate = document.createElement('div');
    nameplate.id = `nameplate-${playerId}`;
    nameplate.textContent = username;
    opponentDiv.appendChild(nameplate);

    opponentState.canvases[playerId] = draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, opponentDiv);
    opponentState.users[playerId] = username;
    opponentState.opponents[playerId] = opponentDiv;

    let opponentArr = Object.keys(opponentState.opponents);
    opponentArr.sort((a, b) => {
        return a.localeCompare(b, "en");
    });
    opponentArr.forEach((id, i) => {
        opponentState.opponents[id].style.order = i;
    })
}

// update the displayed stats when another player places a piece or changes username
const update = (playerId, board, username) => {
    opponentState.boards[playerId] = board;

    // update username if it's been changed
    if(username != null && opponentState.users[playerId] != null && opponentState.users[playerId] != username) {
        let nameplate = document.getElementById(`nameplate-${playerId}`);
        nameplate.textContent = username;

        opponentState.users[playerId] = username;
    }

    if(!Object.keys(opponentState.canvases).includes(playerId))
        join(playerId, username);
}

// start the match
const startMatch = () => {
    utils.request({player: session.id, settings: settings.exportSettings()}, window.location.origin + '/start');
}

// pause match
const pauseMatch = () => {
    if(session.isHost)
        utils.request({ player: session.id }, window.location.origin + '/pause');
}

// give player host UI elements (start/end button)
const setHostUi = () => {
    // start button
    utils.newButton('New Game', startMatch, 'startbutton', divs.controlsDiv);

    // pause button
    utils.newButton('Pause', pauseMatch, 'pauseButton', divs.controlsDiv);
}

// place universal ui elements
const initUI = (players) => {
    divs.boardsDiv.innerHTML = '';
    divs.controlsDiv.innerHTML = '';

    // place all opponent boards
    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const board = players[playerId].board.length == 0 ? gameUtils.newGrid(10, 40) : players[playerId].board;
        update(playerId, board, players[playerId].username);
    }

    // place host ui elements
    if(session.isHost)
        setHostUi();

    settings.init(session.username, session.isHost);

    utils.newButton('Settings', settings.openSettings, 'settingsButton', divs.controlsDiv);
}

// when you are the only player left in a match you become the host
const becomeHost = () => {
    session.becomeHost();
    setHostUi();
}

// set keybindings
const setInputBinds = () => {
    input.bindKey('ArrowLeft', game.events.left, true);
    input.bindKey('ArrowRight', game.events.right, true);
    input.bindKey('z', game.events.rotLeft, false);
    input.bindKey('ArrowUp', game.events.rotRight, false);
    input.bindKey('a', game.events.rot180, false);
    input.bindKey('ArrowDown', game.events.softDrop, false);
    input.bindKey(' ', game.events.hardDrop, false);
    input.bindKey('c', game.events.hold, false);
}

// set settings methods
const setSettingBinds = () => {
    settings.bindSetting('usernameSetting', events.settingUsername);
    settings.bindSetting('final', events.settingRollover);
}

export const events = {
    update: (data) => {
        // update the opponent boards only if the update is for another player
        if(data.player == session.id)
            return;
        else if(data.player == session.id && data.lost)
            loop.stop();

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
    start: async (data) => {
        // start match
        await game.start(
            settings.applySettings(data)
        );
        loop.start(1000, tickMethod);
    },
    pause: (data) => {
        game.pause(data.paused);

        if(data.paused)
            loop.stop();
        else
            loop.restart();
    },
    end: (data) => {
        game.pause(true);
        loop.stop();
    },
    settingUsername: (name) => {
        session.usernameUpdate(name);
        game.updateUsername(name);
    },
    settingRollover: (delay, speed) => {
        input.setRollover(delay, speed);
    }
}

export const init = (initSession, initGame) => {
    session = initSession;
    game = initGame;
    setInputBinds();
    setSettingBinds();

    // setup gui elements
    if(divs.boardsDiv && divs.controlsDiv) {
        divs.boardsDiv.remove();
        divs.controlsDiv.remove();
    } 

    divs.rootDiv = document.getElementById('root');
    let bodyDiv = document.getElementsByTagName('body')[0];

    divs.boardsDiv = document.createElement('div');
    divs.boardsDiv.id = 'boards';

    divs.controlsDiv = document.createElement('div');
    divs.controlsDiv.id = 'controls';

    bodyDiv.appendChild(divs.boardsDiv);
    divs.rootDiv.appendChild(divs.controlsDiv);
}

export const getViews = () => {
    let views = [];

    for(let id in opponentState.boards)
        views.push(draw.newView(10, 20, 0, 20, opponentState.boards[id], opponentState.canvases[id]));

    return views;
}