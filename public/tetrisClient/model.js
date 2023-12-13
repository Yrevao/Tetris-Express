const utils = require('./utility.js');
const draw = require('./draw.js');
const blockStore = require('./blockStore.js');

// board details
const maxX = 10;
const maxY = 40;
const viewHeight = 20; // height the player actually sees
let boardCanvas = null;

// game state verified with the server
let state = {
    board: utils.newGrid(maxX, maxY),
    bagA: [1],
    bagB: [],
    bagPos: 0,
    hold: null,
    playX: 5,
    playY: 15,
    playRot: 0
}

// get the current piece's grid
const getPiece = () => {
    return blockStore.idToLetter[state.bagA[state.bagPos]](state.playRot);
}

// clear the piece currently being played, or lock it
const clearPlay = (lock) => {
    for(let i = 0; i < state.board.length; i++) {
        for(let j = 0; j < state.board[0].length; j++) {
            if(state.board[i][j] != null && !state.board[i][j].locked) {
                if(lock) {
                    state.board[i][j].locked = true;
                }
                else {
                    state.board[i][j] = null;
                }
            }
        }
    }
}

// move all not locked blocks in the grid down one
const doGravity = () => {
    clearPlay(false);

    if(!utils.checkBoxColl(state.playX, state.playY + 1, state.board, getPiece())) {
        state.playY += 1;
        utils.stamp(state.playX, state.playY, state.board, getPiece());
    }
    else {
        utils.stamp(state.playX, state.playY, state.board, getPiece());
        clearPlay(true);
    }
}

// testing code
export const blockFall = () => {
    setTimeout(() => {
        doGravity();
        draw.cls(boardCanvas);
        draw.drawBoard(state.board, maxY, boardCanvas);
        blockFall();
    }, 100);
}

// entry point for index
export const startClient = (playfieldCanvas) => {
    boardCanvas = playfieldCanvas;

    blockFall()
}