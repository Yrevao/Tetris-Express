const gameUtils = require('./gameUtils');
const draw = require('./draw');
let session = null;
let boardsDiv = null
let canvases = {};
let boards = {};

export const init = (initSession) => {
    session = initSession;
    const root = document.getElementById('root');
    boardsDiv = document.createElement('div');
    boardsDiv.id = 'boards';
    root.appendChild(boardsDiv);
}

export const getViews = () => {
    let views = [];

    for(let id in boards)
        views.push(draw.newView(10, 20, 0, 20, boards[id], canvases[id]));

    return views;
}

// remove board when a player leaves
const leave = (playerId) => {
    let canvas = document.getElementById(`board-${playerId}`);
    canvas.remove();

    delete canvases[playerId];
    delete boards[playerId];
}

// when another player joins add a board
const join = (playerId) => {
    canvases[playerId] = draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, boardsDiv);

    let canvasArr = Object.keys(canvases);
    canvasArr.sort((a, b) => {
        return a.localeCompare(b, "en");
    });
    canvasArr.forEach((id, i) => {
        console.log(canvases[id].style);
        canvases[id].style.order = i;
    })
}

// update the displayed boards when another player places a piece
const update = (playerId, board) => {
    boards[playerId] = board;

    if(!Object.keys(canvases).includes(playerId))
        join(playerId);
}

const initBoards = (players) => {
    boardsDiv.innerHTML = '';

    for(let playerId in players) {
        if(playerId == session.id)
            continue;

        const board = players[playerId].board.length == 0 ? gameUtils.newGrid(10, 40) : players[playerId].board;
        update(playerId, board);
    }
}

export const events = {
    update: (data) => {
        // update the opponent boards
        if(data.player == session.id)
            return;

        switch(data.flag) {
            case 'init':
                initBoards(data.players);
                break;
            case 'update':
                update(data.player, data.board);
                break;
            case 'join':
                join(data.player);
                break;
            case 'leave':
                leave(data.player);
                break;
        }
    }
}