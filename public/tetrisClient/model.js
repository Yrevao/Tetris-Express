const utils = require('./utility.js');
const blockStore = require('./blockStore.js');

// board grid details
const maxX = 10;
const maxY = 40;
let boardCanvas = null;

// key buffer, stores key: { current down state, presses to execute, milliseconds down }
let keyBuffer = {};

// settings verified with the server
export let settings = {
    rolloverMs: 167,        // how long to hold a key before repeat inputs
    rolloverSpeed: 33,      // how fast to repeat inputs
    gravityTime: 1000,      // how long the piece in play takes to move down one cell
    lockDelay: 500          // how long a piece takes to lock after landing in ms
}

// game state verified with the server
export let state = {
    board: utils.newGrid(maxX, maxY),   // game board grid
    bagA: [1],                          // main piece bag
    bagB: [],                           // buffer piece bag
    bagPos: 0,                          // current position in bag
    hold: null,                         // held piece
    playX: 5,                           // x position of piece in play
    playY: 20,                          // y position
    playRot: 0,                         // rotation
}

// game state not verified with the server
let playLandTime = -1;      // Date.now() of when the piece in play landed 
let playLastGravity = -1;   // Date.now() of when the piece in play last moved down a cell

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

    playLastGravity = Date.now();
}

// run one update cycle
export const tick = () => {
    // do keystroke actions
    checkKeys();

    // update board
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

// check keystroke buffer
const checkKeys = () => {
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
            if(msDown >= settings.rolloverMs && !keyState.rollover) {
                keyState.rollover = true;
                keyState.lastAction = Date.now();
                keyState.presses++;
            }
            else if(msIdle >= settings.rolloverSpeed && keyState.rollover) {
                // calculate how many rollovers have happened since the last tick
                const rolloverActions = Math.floor(msIdle / settings.rolloverSpeed);

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

// set the current user input
export const keyAction = (key, down) => {
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
export let keyMap = {
    'ArrowUp': 'rotcw',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowDown': 'fastdrop'
}
// controls to functions
const controlMap = {
    'rotcw': () => {
        move(0, 1);
    },
    'left': () => {
        move(-1, 0);
    },
    'right': () => {
        move(1, 0);
    },
    'fastdrop': () => {
        
    }
}

// get the current piece's grid
const getPiece = (rot) => {
    if(rot != null)
        return blockStore.idToLetter[state.bagA[state.bagPos]](rot);

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

    // how far to move a piece
    let gravityDebt = Math.floor((Date.now() - playLastGravity) / settings.gravityTime);

    // check if enought time has passed to move the piece down
    if(gravityDebt >= 1) {
        // check if piece can drop without collision
        if(!utils.checkBoxColl(state.playX, state.playY + gravityDebt, state.board, getPiece())) {
            playLastGravity = Date.now();
            state.playY += gravityDebt;
        }
        // if the piece has landed then check for how long
        else {
            if(playLandTime < 0)
                playLandTime = Date.now()
            else if((Date.now() - playLandTime) >= settings.lockDelay)
                clearPlay(true);
        }
    }

    utils.stamp(state.playX, state.playY, state.board, getPiece());
}

// move or rotate a piece
const move = (dx, drot) => {
    // update piece position values
    let newX = state.playX + dx;
    let newRot = state.playRot + drot;

    // clamp rotation
    newRot = newRot % 4;

    // update state with new values if theres no colision
    if(!utils.checkBoxColl(state.playX, state.playY, state.board, getPiece(newRot)))
        state.playRot = newRot;

    if(!utils.checkBoxColl(newX, state.playY, state.board, getPiece()))
        state.playX = newX;
}