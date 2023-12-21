const utils = require('./utility.js');
const blockStore = require('./blockStore.js');

// board grid details
const maxX = 10;
const maxY = 40;
let boardCanvas = null;

// gameplay settings
export let settings = {
    rolloverMs: 167,            // how long to hold a key before repeat inputs
    rolloverSpeed: 33,          // how fast to repeat inputs
    gravityTime: 200,           // how long the piece in play takes to move down one cell in ms
    levelGravity: 1000 / 5,     // fall speed of current level
    softDropGravity: 1000 / 20, // fall speed of soft drop
    lockDelay: 500              // how long a piece takes to lock after landing in ms
}

// game state
export let state = {
    board: utils.newGrid(maxX, maxY),   // game board grid
    bag: [0, 1, 2, 3, 4, 5, 6],         // main piece bag
    hold: null,                         // held piece
    playX: 3,                           // x position of piece in play
    playY: 18,                          // y position
    playRot: 0,                         // rotation
    playLandTime: -1,                   // Date.now() of when the piece in play landed 
    playLastGravity: -1                 // Date.now() of when the piece in play last moved down a cell
}

// keystate object
const newKeyState = (action, doRollover) => {
    return {
        action: action,
        down: false,
        rollover: false,
        doRollover: doRollover,
        whenDown: -1,
        lastAction: -1,
        presses: 0
    }
}

// init and setup game
export const init = (canvas) => {
    boardCanvas = canvas;

    state.playLastGravity = Date.now();
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
    for(let k in keyMap) {
        // get state and function for key
        const keyState = keyMap[k];
        const action = keyMap[k].action;
        const keyFunction = controlMap[action];

        // check if key is held long enough for rollover
        if(keyState.doRollover && keyState.down) {
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
            keyFunction(keyState);
        }

        keyMap[k] = keyState;
    }
}

// set the current user input
export const keyAction = (key, down) => {
    // make sure the key is bound to an action
    if(!Object.getOwnPropertyNames(keyMap).includes(key))
        return;

    // only set key if it's down, mapped to something, and has not been held
    if(down && keyMap[key].whenDown == -1) {
        let keyState = keyMap[key];

        keyState.down = true;
        keyState.presses++;
        keyState.whenDown = Date.now();
        keyState.lastAction = Date.now();

        keyMap[key] = keyState;
    }
    // on keyup set key as not down
    else if(!down) {
        let keyState = keyMap[key];

        keyState.down = false;
        keyState.presses++;
        keyState.rollover = false;
        keyState.whenDown = -1;
        keyState.lastAction = -1;

        keyMap[key] = keyState;
    }
}

// keys to controls
export let keyMap = {
    'ArrowLeft': newKeyState('left', true),
    'ArrowRight': newKeyState('right', true),
    'z': newKeyState('rotLeft', false),
    'ArrowUp': newKeyState('rotRight', false),
    'a': newKeyState('rot180', false),
    'ArrowDown': newKeyState('softDrop', false),
    ' ': newKeyState('hardDrop', false),
    'c': newKeyState('hold', false)

}
// controls to functions
const controlMap = {
    'left': (k) => {
        if(k.down)
            move(-1, 0);
    },
    'right': (k) => {
        if(k.down)
            move(1, 0);
    },
    'rotLeft': (k) => {
        if(k.down)    
            move(0, 3);
    },
    'rotRight': (k) => {
        if(k.down)
            move(0, 1);
    },
    'rot180': (k) => {
        if(k.down)
            move(0, 2);
    },
    'softDrop': (k) => {
        const oldTime = settings.gravityTime;
        settings.gravityTime = k.down ? settings.softDropGravity : settings.levelGravity;
        
        // difference factor between the set gravity and previous gravity
        const timeCoef = settings.gravityTime / oldTime;
        // scaled time since the last gravity tick
        const gravityTimeScaled = (Date.now() - state.playLastGravity) * timeCoef;
        // scaled time at the last gravity tick
        state.playLastGravity = Date.now() - gravityTimeScaled;
    },
    'hardDrop': (k) => {
        
    },
    'hold': (k) => {

    }
}

// get the current piece's grid
const getPiece = (rot) => {
    if(rot != null)
        return blockStore.idToLetter[state.bag[0]](rot);

    return blockStore.idToLetter[state.bag[0]](state.playRot);
}

// load a new piece after landing
const nextPiece = () => {
    // reset piece data
    state.playX = 3;
    state.playY = 18;
    state.playRot = 0;
    state.playLandTime = -1;
    state.playLastGravity = Date.now();

    // go to the next piece in bag
    state.bag.shift();
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
    let gravityDebt = Math.floor((Date.now() - state.playLastGravity) / settings.gravityTime);

    // check if enought time has passed to move the piece down
    if(gravityDebt >= 1) {
        state.playLastGravity = Date.now();

        // check if piece can drop without collision
        if(!utils.checkBoxColl(state.playX, state.playY + gravityDebt, state.board, getPiece())) {
            state.playLandTime = -1;
            state.playY += gravityDebt;
        }
        // if the piece has landed then check for how long
        else {
            // start lock timer if the piece just landed, otherwise check if lock timer is complete
            if(state.playLandTime < 0)
                state.playLandTime = Date.now()
            else if((Date.now() - state.playLandTime) >= settings.lockDelay) {
                utils.stamp(state.playX, state.playY, state.board, getPiece());
                clearPlay(true);
                nextPiece();
            }
        }
    }

    utils.stamp(state.playX, state.playY, state.board, getPiece());
}

// using a set of SRS wall kicks find the first one that allows the piece to rotate without hitting anything
const kick = (rot) => {
    const kickData = blockStore.getKickData(state.bag[0], state.playRot, rot);

    for(let i = 0; i < kickData.length; i++) {
        const kick = kickData[i];

        const kickX = state.playX + kick[0];
        const kickY = state.playY + kick[1];

        if(!utils.checkBoxColl(kickX, kickY, state.board, getPiece(rot))) {
            console.log(kick);
            state.playX = kickX;
            state.playY = kickY;
            state.playRot = rot;
            return;
        }
    }
}

// move or rotate a piece
const move = (dx, drot) => {
    // update piece position values
    let newX = state.playX + dx;
    let newRot = state.playRot + drot;

    // clamp rotation
    newRot = newRot % 4;

    // update state with new values if theres no colision
    if(drot != 0)
        kick(newRot);

    if(!utils.checkBoxColl(newX, state.playY, state.board, getPiece()))
        state.playX = newX;
}