const utils = require('./utility.js');
const blockStore = require('./blockStore.js');

// board details
const maxX = 10;
const maxY = 40;
let boardCanvas = null;

// key buffer, stores key: { current down state, presses to execute, milliseconds down }
let keyBuffer = {};

// how long to hold a key before repeat presses; how fast to repeat press
let rolloverMs = 1000;
let rolloverSpeed = 100;

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

    // initalize key buffer with key state objects
    for(let k in keyMap) {
        keyBuffer[k] = {
            down: false,
            rollover: false,
            whenDown: -1,
            lastAction: -1,
            presses: 0
        }
    }
}

// run one update cycle
export const tick = () => {
    // update board
    doGravity();

    // check keystrokes
    for(let k in keyBuffer) {
        // get state and function for key
        const keyState = keyBuffer[k];
        const action = keyMap[k];
        const keyFunction = controlMap[action];
        
        // check if key is held long enough for rollover
        if(keyState.down) {
            // update how long the key has been down for
            const msDown = Date.now() - keyState.whenDown;
            const msIdle = Date.now() - keyState.lastAction;

            // do something if the key has been held down long enough
            if(msDown >= rolloverMs && !keyState.rollover) {
                keyState.rollover = true;
                keyState.lastAction = Date.now();
                keyState.presses++;
            }
            else if(msIdle >= rolloverSpeed && keyState.rollover) {
                // calculate how many rollovers have happened since the last tick
                const rolloverActions = Math.floor(msIdle / rolloverSpeed);

                keyState.lastAction = Date.now();
                keyState.presses = rolloverActions;
            }
        }
        
        // activate the key however many times it was pressed in one update cycle
        for(;keyState.presses > 0; keyState.presses--) {
            keyFunction();
        }

        keyBuffer[k] = keyState;
    }
}

// return canvas and state info for updating the displayed game board
export const getGameView = () => {
    return {
        board: state.board,
        maxY: maxY,
        canvas: boardCanvas
    }
}

// set the current user input
export const move = (key, down) => {
    // only set key if it's down, mapped to something, and has not been held
    if(down && Object.getOwnPropertyNames(keyMap).includes(key) && keyBuffer[key].whenDown == -1) {
        keyBuffer[key].down = true;
        keyBuffer[key].presses++;
        keyBuffer[key].whenDown = Date.now();
        keyBuffer[key].lastAction = Date.now();
    }
    // on keyup set key as not down
    else if(!down) {
        keyBuffer[key].down = false;
        keyBuffer[key].rollover = false;
        keyBuffer[key].whenDown = -1;
        keyBuffer[key].lastAction = -1;
    }
}

// keys to controls
export const keyMap = {
    'ArrowUp': 'rotcw',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowDown': 'fastdrop'
}
// controls to functions
const controlMap = {
    'rotcw': () => {
        
    },
    'left': () => {
        
    },
    'right': () => {
        
    },
    'fastdrop': () => {
        
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