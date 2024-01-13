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
let divs = {
    rootDiv: null,
    controlsDiv: null,
    boardsDiv: null,
    settingsModal: null,
}
// buttons
let buttons = {
    startButton: null,
    pauseButton: null,
    settingsButton: null,
}
// other players
let opponentState = {
    opponents: {},
    canvases: {},
    boards: {},
    users: {},
}
// settings data
let localSettingList = {    // local settings are set on the client side
    username: null,
    autorepeatDelay: 167,
    autorepeatSpeed: 33,
}
let globalSettingList = {   // global settings are set for all players by the host
    forceSettings: false,
    sevenBag: true,
    gravity: 5,
    softDrop: 80,
    lockDelay: 500,
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
    <br>
    <label for="gravity">Gravity cells per second</label>
        <input type="number" required minlength="1" value=5 id="gravity"></input>
    <br>
    <label for="softDrop">Soft Drop cells per second</label>
        <input type="number" required minlength="1" value=80 id="softDrop"></input>
    <br>
    <label for="lockDelay">Lock delay time in ms</label>
        <input type="number" required minlength="1" value=500 id="lockDelay"></input>
`
// settings menu methods
let settingMethods = {
    username: (name) => { 
        session.usernameUpdate(name);
        game.updateUsername(name); 
    },
    autorepeatDelay: (ms) => { localSettingList.autorepeatDelay = ms },
    autorepeatSpeed: (ms) => { localSettingList.autorepeatSpeed = ms },
    gravity: (n) => { globalSettingList.gravity = n },
    softDrop: (n) => { globalSettingList.softDrop = n },
    lockDelay: (ms) => { globalSettingList.lockDelay = ms },
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

// method run durring each game tick
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
    utils.request({player: session.id, settings: {local: localSettingList, global: globalSettingList}}, window.location.origin + '/start');
}

// pause match
const pauseMatch = () => {
    utils.request({ player: session.id }, window.location.origin + '/pause');
}

// open settings menu
const openSettings = () => {
    if(divs.settingsModal == null)
        return;

    for(let setting in localSettingList) {
        setUISetting(setting, localSettingList[setting]);
    }

    divs.settingsModal.style.display = 'block';
}

const closeSettings = () => {
    divs.settingsModal.style.display = 'none';
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
    divs.settingsModal = document.createElement('div');
    divs.settingsModal.id = 'settingsModal';

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

    divs.settingsModal.appendChild(menuDiv);
    divs.rootDiv.appendChild(divs.settingsModal);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);

    // close the modal if the close button or if the page around the modal is clicked
    document.getElementsByClassName('close')[0].onclick = closeSettings;
    window.onclick = (event) => {
        if(event.target == divs.settingsModal)
            closeSettings();
    }

    // settings elements that depend on server side data
    localSettingList.username = session.username;
    document.getElementById('username').value = session.username;
}

// give player host UI elements (start/end button)
const setHostUi = () => {
    if(buttons.startButton || buttons.settingsButton || buttons.pauseButton) {
        buttons.startButton.remove();
        buttons.settingsButton.remove();
        buttons.pauseButton.remove();
    }
    
    buttons.startButton = document.createElement('button');
    buttons.startButton.textContent = 'New Game';
    buttons.startButton.onclick = startMatch;
    divs.rootDiv.appendChild(buttons.startButton);

    buttons.pauseButton = document.createElement('button');
    buttons.pauseButton.textContent = 'Pause';
    buttons.pauseButton.onclick = pauseMatch;
    divs.rootDiv.appendChild(buttons.pauseButton);

    divs.controlsDiv.appendChild(buttons.startButton);
    divs.controlsDiv.appendChild(buttons.pauseButton);
}

// clear and repopulate opponent boards display
const initUI = (players) => {
    divs.boardsDiv.innerHTML = '';
    divs.controlsDiv.innerHTML = '';

    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const board = players[playerId].board.length == 0 ? gameUtils.newGrid(10, 40) : players[playerId].board;
        update(playerId, board, players[playerId].username);
    }

    if(session.isHost)
        setHostUi();

    // UI elements all players get

    // reset gui elements to prevent duplicates
    if(divs.settingsModal)
        divs.settingsModal.remove();

    newSettingsModal();
    buttons.settingsButton = document.createElement('button');
    buttons.settingsButton.textContent = 'Settings';
    buttons.settingsButton.onclick = openSettings;
    divs.rootDiv.appendChild(buttons.settingsButton);

    divs.controlsDiv.appendChild(buttons.settingsButton);
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
        // sync settings to host
        if(data.global.forceSettings) {
            localSettingList.autorepeatDelay = data.local.autorepeatDelay;
            localSettingList.autorepeatSpeed = data.local.autorepeatSpeed;
        }

        globalSettingList = data.global;
        setSettings();

        // start match
        await game.start(
            {
                levelGravity: 1000 / globalSettingList.gravity,
                softDropGravity: 1000 / globalSettingList.softDrop,
                lockDelay: globalSettingList.lockDelay
            }
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
    }
}

export const init = (initSession, initGame) => {
    session = initSession;
    game = initGame;
    setBinds();

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