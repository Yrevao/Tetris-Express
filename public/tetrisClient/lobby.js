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
let controlsDiv = null;
let boardsDiv = null;
let settingsModal = null;
// buttons
let startButton = null;
let endButton = null;
let settingsButton = null;
// other players
let opponents = {};
let canvases = {};
let boards = {};
let users = {};
// settings data
let localSettingList = {    // local settings are set on the client side
    username: null,
    autorepeatDelay: 167,
    autorepeatSpeed: 33,
}
let globalSettingList = {   // global settings are set for all players by the host
    forceSettings: false,
    sevenBag: true,
}
let localSettingHTML = `
<p>Local Settings</p>
    <label for="username">Username: </label>
        <input type="text" required minlength="1" id="username"></input>
    <br>
    <label for="autorepeatDelay">Key Autorepeat Delay (ms):</label> 
        <input type="number" required minlength="1" value=167 id="autorepeatDelay"></input>
    <br>
    <label for="autorepeatSpeed">Key Autorepeat Speed (ms):</label> 
        <input type="number" required minlength="1" min="1" value=33 id="autorepeatSpeed"></input>
`;
let globalSettingHTML = `
<p>Global Settings</p>
    <label for="forceSettings">Enforce Local Settings</label>
        <input type="checkbox" id="forceSettings">
    <br>
    <label for="sevenBag">7-Bag RNG:</label>
        <input type="checkbox" id="sevenBag" checked="true">
`
// settings menu methods
let settingMethods = {
    username: (name) => { 
        session.usernameUpdate(name);
        game.updateUsername(name); 
    },
    autorepeatDelay: (ms) => { localSettingList.autorepeatDelay = ms },
    autorepeatSpeed: (ms) => { localSettingList.autorepeatSpeed = ms }
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
    utils.request({player: session.id, match: session.match, settings: {local: localSettingList, global: globalSettingList}}, window.location.origin + '/start');
}

// end match
const endMatch = () => {
    utils.request({ player: session.id, match: session.match }, window.location.origin + '/end');
}

// open settings menu
const openSettings = () => {
    if(settingsModal == null)
        return;

    for(let setting in localSettingList) {
        setUISetting(setting, localSettingList[setting]);
    }

    settingsModal.style.display = 'block';
}

const closeSettings = () => {
    settingsModal.style.display = 'none';
}

const setSettings = () => {
    for(let setting in localSettingList) {
        let value = localSettingList[setting];
        settingMethods[setting](value);
    }

    input.setRollover(localSettingList.autorepeatDelay, localSettingList.autorepeatSpeed);
}

// set setting only in UI
const setUISetting = (setting, value) => {
    const settingElement = document.getElementById(setting);

    switch(settingElement.type) {
        case "text":
            settingElement.value = value;
        case "number":
            settingElement.value = value;
            break;
        case "checkbox":
            settingElement.checked = value;
            break;
    }
}

const getUISetting = (setting) => {
    const settingElement = document.getElementById(setting);

    switch(settingElement.type) {
        case "text":
            return settingElement.value;
        case "number":
            return settingElement.value;
        case "checkbox":
            return settingElement.checked;
    }
}

const saveSettings = (event) => {
    // keep form from refreshing page pt1
    event.preventDefault();

    for(let setting in localSettingList) {
        let value = getUISetting(setting);
        localSettingList[setting] = value;
    }
    if(session.isHost)
        for(let setting in globalSettingList) {
            let value = getUISetting(setting);
            globalSettingList[setting] = value;
        }

    setSettings();
    closeSettings();

    // keep form from refreshing page pt2
    return false;
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
        <form id="settingsForm">
            ${localSettingHTML}
        <br>
            ${session.isHost ? globalSettingHTML : '<i>You must be host to change global settings</i>'}
        <br>
        <input type="submit" value="Save">
        </form>
    `;

    settingsModal.appendChild(menuDiv);
    rootDiv.appendChild(settingsModal);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);

    // close the modal if the close button or if the page around the modal is clicked
    document.getElementsByClassName('close')[0].onclick = closeSettings;
    window.onclick = (event) => {
        if(event.target == settingsModal)
            closeSettings();
    }

    // settings elements that depend on server side data
    localSettingList.username = session.username;
    document.getElementById('username').value = session.username;
}

// give player host UI elements (start/end button)
const setHostUi = () => {
    if(startButton) {
        startButton.remove();
        settingsButton.remove();
    }
    
    startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.onclick = startMatch;
    rootDiv.appendChild(startButton);

    endButton = document.createElement('button');
    endButton.textContent = 'End';
    endButton.onclick = endMatch;
    rootDiv.appendChild(endButton);

    controlsDiv.appendChild(startButton);
    controlsDiv.appendChild(endButton);
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

    if(session.isHost)
        setHostUi();

    // UI elements all players get
    newSettingsModal();
    settingsButton = document.createElement('button');
    settingsButton.textContent = 'Settings';
    settingsButton.onclick = openSettings;
    rootDiv.appendChild(settingsButton);

    controlsDiv.appendChild(settingsButton);
}

// when you are the only player left in a match you become the host
const becomeHost = () => {
    session.becomeHost();
    setHostUi();
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
        // sync settings to host
        if(data.global.forceSettings) {
            localSettingList.autorepeatDelay = data.local.autorepeatDelay;
            localSettingList.autorepeatSpeed = data.local.autorepeatSpeed;
        }

        globalSettingList = data.global;
        setSettings();

        // start match
        await game.start();
        loop.start(1000, tickMethod);
    },
    end: (data) => {
        loop.stop();
    }
}

export const init = (initSession, initGame) => {
    session = initSession;
    game = initGame;
    setBinds();

    // setup gui elements
    rootDiv = document.getElementById('root');
    let bodyDiv = document.getElementsByTagName('body')[0];

    boardsDiv = document.createElement('div');
    boardsDiv.id = 'boards';

    controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';

    bodyDiv.appendChild(boardsDiv);
    rootDiv.appendChild(controlsDiv);
}

export const getViews = () => {
    let views = [];

    for(let id in boards)
        views.push(draw.newView(10, 20, 0, 20, boards[id], canvases[id]));

    return views;
}