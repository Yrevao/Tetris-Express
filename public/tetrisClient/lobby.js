const gameUtils = require('./gameUtils');
const utils = require('./utils');
const draw = require('./draw');
let session = null;
let rootDiv = null;
let boardsDiv = null;
let startButton = null;
let opponents = {};
let canvases = {};
let boards = {};
let users = {};
export let userName = '';

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

// clear and repopulate opponent boards display
const initBoards = (players) => {
    boardsDiv.innerHTML = '';

    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const board = players[playerId].board.length == 0 ? gameUtils.newGrid(10, 40) : players[playerId].board;
        update(playerId, board, players[playerId].username);
    }

    // give player a start button if they are the host
    if(session.isHost) {
        if(startButton)
            startButton.remove();
        
        startButton = document.createElement('button');
        startButton.textContent = 'Start';
        startButton.onclick = startMatch;
        rootDiv.appendChild(startButton);
    }
}

// when you are the only player left in a match you become the host
const becomeHost = () => {
    session.becomeHost();
    initBoards();
}

export const events = {
    update: (data) => {
        // update the opponent boards only if the update is for another player
        if(data.player == session.id)
            return;

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
    }
}

export const init = (initSession) => {
    session = initSession;

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