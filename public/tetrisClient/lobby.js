const draw = require('./draw');
let session = null;
let boardsDiv = null
let canvases = {};
let boards = {};

export const init = (initSession) => {
    session = initSession;

    const root = document.getElementById('root');
    boardsDiv = document.createElement('div');
    root.appendChild(boardsDiv);
}

export const getViews = () => {
    let views = [];

    for(let id in boards)
        views.push(draw.newView(10, 20, 0, 20, boards[id], canvases[id]));

    return views;
}

const leave = (playerId) => {
    let canvas = document.getElementById(`board-${playerId}`);
    canvas.remove();

    delete canvases[playerId];
    delete boards[playerId];
}

const join = (playerId) => {
    canvases[playerId] = draw.newPlayfieldCanvas(1000, 2000, '10vh', `board-${playerId}`, boardsDiv);
}

const update = (playerId, board) => {
    boards[playerId] = board;

    if(!Object.keys(canvases).includes(playerId))
        join(playerId);
}

export const events = {
    update: (data) => {
        if(data.player == session.id)
            return;

        switch(data.flag) {
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