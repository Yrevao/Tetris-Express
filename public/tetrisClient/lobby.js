// modules
const gameUtils = require('./gameUtils');
const utils = require('./utils');
const draw = require('./draw');
const loop = require('./loop.js');
const input = require('./input.js');
// shared objects
let session = null;
let game = null;
// page separation
let rootDiv = null;
let boardsDiv = null;
let settingsModal = null;
// buttons
let startButton = null;
let settingsButton = null;
// other players
let opponents = {};
let canvases = {};
let boards = {};
let users = {};
// settings object
let settingList = {
    autorepeatDelay: 167,
    autorepeatSpeed: 33
}
// settings menu methods
let settingMethods = {
    autorepeatDelay: (ms) => { settingList.autorepeatDelay = ms },
    autorepeatSpeed: (ms) => { settingList.autorepeatSpeed = ms }
}

// remove board when a player leaves
const leave = (playerId) => {
    let opponent = document.getElementById(`opponent-${playerId}`);
    opponent.remove();

    delete opponents[playerId];
    delete canvases[playerId];
    delete boards[playerId];
    delete users[playerId];
}

// when another player joins add a board
const join = (playerId, username) => {
    let opponentDiv = document.createElement('div');
    boardsDiv.appendChild(opponentDiv);
    opponentDiv.id = `opponent-${playerId}`;

    let nameplate = document.createElement('div');
    nameplate.id = `nameplate-${playerId}`;
    nameplate.textContent = username;
    opponentDiv.appendChild(nameplate);

    canvases[playerId] = draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, opponentDiv);
    users[playerId] = username;
    opponents[playerId] = opponentDiv;

    let opponentArr = Object.keys(opponents);
    opponentArr.sort((a, b) => {
        return a.localeCompare(b, "en");
    });
    opponentArr.forEach((id, i) => {
        opponents[id].style.order = i;
    })
}

// update the displayed stats when another player places a piece or changes username
const update = (playerId, board, username) => {
    boards[playerId] = board;

    // update username if it's been changed
    if(username != null && users[playerId] != null && users[playerId] != username) {
        let nameplate = document.getElementById(`nameplate-${playerId}`);
        nameplate.textContent = username;

        users[playerId] = username;
    }

    if(!Object.keys(canvases).includes(playerId))
        join(playerId, username);
}

// start the match
const startMatch = () => {
    utils.request({player: session.id, match: session.match}, window.location.origin + '/start')
        .then((data) => {
            // match started
        });
}

// open settings menu
const openSettings = () => {
    if(settingsModal == null)
        return;

    for(let setting in settingList) {
        document.getElementById(setting).textContent = settingList[setting];
    }

    settingsModal.style.display = 'block';
}

const closeSettings = () => {
    if(settingsModal == null)
        return;

    settingsModal.style.display = 'none';
}

const setSettings = () => {
    for(let setting in settingMethods) {
        let value = settingList[setting];
        settingMethods[setting](value);
    }

    input.setRollover(settingList.autorepeatDelay, settingList.autorepeatSpeed);
}

const saveSettings = () => {
    for(let setting in settingMethods) {
        let value = document.getElementById(setting).value;
        settingList[setting] = value;
        console.log(setting + ' ' + value);
    }

    setSettings();
    closeSettings();
}

// generate settings modal
const newSettingsModal = () => {
    settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';

    let menuDiv = document.createElement('div');
    menuDiv.id = 'settingsMenu';

    // add menu elements
    menuDiv.innerHTML = `
        <span class="close">&times;</span>
        <p>Tetris Settings</p>
        Key Autorepeat Delay (ms): <textarea rows=1 cols=10 id="autorepeatDelay"></textarea>
        <br>
        Key Autorepeat Speed (ms): <textarea rows=1 cols=10 id="autorepeatSpeed"></textarea>
        <br>
        <button id="saveButton">Save</button>
    `;

    settingsModal.appendChild(menuDiv);
    rootDiv.appendChild(settingsModal);
    document.getElementById('saveButton').onclick = saveSettings;

    // close the modal if the close button or if the page around the modal is clicked
    document.getElementsByClassName('close')[0].onclick = closeSettings;
    window.onclick = (event) => {
        if(event.target == settingsModal)
            closeSettings();
    }
}

// clear and repopulate opponent boards display
const initBoards = (players) => {
    boardsDiv.innerHTML = '';

    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const board = players[playerId].board.length == 0 ? gameUtils.newGrid(10, 40) : players[playerId].board;
        update(playerId, board, players[playerId].username);
    }

    // give player host UI elements (start and settings button)
    if(session.isHost) {
        if(startButton) {
            startButton.remove();
            settingsButton.remove();
        }
        
        startButton = document.createElement('button');
        startButton.textContent = 'Start';
        startButton.onclick = startMatch;
        rootDiv.appendChild(startButton);

        newSettingsModal();
        settingsButton = document.createElement('button');
        settingsButton.textContent = 'Settings';
        settingsButton.onclick = openSettings;
        rootDiv.appendChild(settingsButton);
    }
}

// when you are the only player left in a match you become the host
const becomeHost = () => {
    session.becomeHost();
    initBoards();
}

// set keybindings
const setBinds = () => {
    input.bindKey('ArrowLeft', game.events.left, true);
    input.bindKey('ArrowRight', game.events.right, true);
    input.bindKey('z', game.events.rotLeft, false);
    input.bindKey('ArrowUp', game.events.rotRight, false);
    input.bindKey('a', game.events.rot180, false);
    input.bindKey('ArrowDown', game.events.softDrop, false);
    input.bindKey(' ', game.events.hardDrop, false);
    input.bindKey('c', game.events.hold, false);
}

const tickMethod = () => {
    input.checkKeys();
    game.tick();

    const views = game.getViews().concat(getViews());
    gameUtils.updateViews(views);
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
                initBoards(data.players);
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
        setSettings();
        await game.start();
        loop.start(1000, tickMethod);
    }
}

export const init = (initSession, initGame) => {
    session = initSession;
    game = initGame;
    setBinds();

    // setup gui elements
    rootDiv = document.getElementById('root');
    boardsDiv = document.createElement('div');

    boardsDiv.id = 'boards';
    rootDiv.appendChild(boardsDiv);
}

export const getViews = () => {
    let views = [];

    for(let id in boards)
        views.push(draw.newView(10, 20, 0, 20, boards[id], canvases[id]));

    return views;
}