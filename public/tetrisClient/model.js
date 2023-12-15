const utils = require('./utility.js');
const blockStore = require('./blockStore.js');

// board details
const maxX = 10;
const maxY = 40;
let boardCanvas = null;

// game state verified with the server
export let state = {
    board: utils.newGrid(maxX, maxY),
    bagA: [1],
    bagB: [],
    bagPos: 0,
    hold: null,
    playX: 5,
    playY: 15,
    playRot: 0
}

// init and setup game
export const init = (canvas) => {
    boardCanvas = canvas;
}

// run one update cycle
export const tick = () => {
    doGravity();
}

// return canvas and state info for updating the displayed game board
export const getGameView = () => {
    return {
        board: state.board,
        maxY: maxY,
        canvas: boardCanvas
    }
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