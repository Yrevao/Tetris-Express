const gameUtils = require('./gameUtils.js');
const blockStore = require('./blockStore.js');

// outside modules
const maxX = 10;
const maxY = 40;
let session = null;
let boardCanvas = null;

// gameplay settings
let settings = {
    gravityTime: 200,           // how long the piece in play takes to move down one cell in ms
    levelGravity: 1000 / 5,     // fall speed of current level
    softDropGravity: 1000 / 20, // fall speed of soft drop
    lockDelay: 500              // how long a piece takes to lock after landing in ms
}

// game state
let state = {
    board: gameUtils.newGrid(maxX, maxY),   // game board grid
    bag: [],                                // main piece bag
    hold: null,                             // held piece
    playX: 3,                               // x position of piece in play
    playY: 18,                              // y position
    playRot: 0,                             // rotation
    playLandTime: -1,                       // Date.now() of when the piece in play landed 
    playLastGravity: -1                     // Date.now() of when the piece in play last moved down a cell
}

// init and start game
export const init = async (initSession, canvas) => {
    session = initSession;
    boardCanvas = canvas;
    state.playLastGravity = Date.now();

    // request bags until there's enough pieces
    while(state.bag.length < 14) {
        await session.requestBag()
            .then(nextBag => {
                state.bag = state.bag.concat(nextBag);
            });
    }
}

// user input methods
export const controlMethods = {
    left: (k) => {
        if(k.down)
            move(-1, 0);
    },
    right: (k) => {
        if(k.down)
            move(1, 0);
    },
    rotLeft: (k) => {
        if(k.down)    
            move(0, 3);
    },
    rotRight: (k) => {
        if(k.down)
            move(0, 1);
    },
    rot180: (k) => {
        if(k.down)
            move(0, 2);
    },
    softDrop: (k) => {
        const oldTime = settings.gravityTime;
        settings.gravityTime = k.down ? settings.softDropGravity : settings.levelGravity;
        
        // difference factor between the set gravity and previous gravity
        const timeCoef = settings.gravityTime / oldTime;
        // scaled time since the last gravity tick
        const gravityTimeScaled = (Date.now() - state.playLastGravity) * timeCoef;
        // scaled time at the last gravity tick
        state.playLastGravity = Date.now() - gravityTimeScaled;
    },
    hardDrop: (k) => {
        if(!k.down)
            return
        state.playY = dropPlay();
        clearPlay(false);
        lockPlay();

    },
    hold: (k) => {
    
    }
}


// run one update cycle
export const tick = () => {
    // update board
    doGravity();
    placeGhost();
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
    if(state.bag.length <= 7) {
        session.requestBag()
            .then(nextBag => {
                state.bag = state.bag.concat(nextBag);
            });
    }
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

// when a row is completely full of locked cells clear that row and shift everything above down one
const clearLines = () => {
    for(let row = 0; row < state.board[0].length; row++) {
        let rowFull = true;
        // if a cell in the row is empty then the row is not full
        for(let col = 0; rowFull && col < state.board.length; col++) {
            if(state.board[col][row] == null)
                rowFull = false;
        }

        // move everything above the current row down one if the row is full
        if(rowFull) {
            for(let r = row; r > 0; r--) {
                for(let c = 0; c < state.board.length; c++) {
                    state.board[c][r] = structuredClone(state.board[c][r - 1]);
                }
            }
        }
    }
}

// find the lowest y value the in play piece can drop to without hitting anything  
const dropPlay = () => {
    for(let y = state.playY; y < maxY; y++) {
        if(gameUtils.checkBoxColl(state.playX, y, state.board, getPiece()))
            return y - 1;
    }
}

// ran when a piece is locked after landing
const lockPlay = () => {
    gameUtils.stamp(state.playX, state.playY, state.board, getPiece());
    clearPlay(true);
    clearLines();
    nextPiece();
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
        if(!gameUtils.checkBoxColl(state.playX, state.playY + gravityDebt, state.board, getPiece())) {
            state.playLandTime = -1;
            state.playY += gravityDebt;
        }
        // if the piece has landed then check for how long
        else {
            // start lock timer if the piece just landed, otherwise check if lock timer is complete
            if(state.playLandTime < 0)
                state.playLandTime = Date.now()
            else if((Date.now() - state.playLandTime) >= settings.lockDelay)
                lockPlay();
        }
    }

    gameUtils.stamp(state.playX, state.playY, state.board, getPiece());
}

// draw the ghost block to show where the piece will land
const placeGhost = () => {
    let ghost = getPiece();

    // apply ghost color
    for(let i in ghost) {
        for(let j in ghost[i]) {
            let g = ghost[i][j];

            if(g != null)
                ghost[i][j].color = gameUtils.applyAlpha(g.color, gameUtils.newColor(192, 192, 192), 0.8, 1);
        }
    }

    gameUtils.stamp(state.playX, dropPlay(), state.board, ghost);
}

// using a set of SRS wall kicks find the first one that allows the piece to rotate without hitting anything
const kick = (rot) => {
    const kickData = blockStore.getKickData(state.bag[0], state.playRot, rot);

    for(let i = 0; i < kickData.length; i++) {
        const kick = kickData[i];

        const kickX = state.playX + kick[0];
        const kickY = state.playY + kick[1];

        if(!gameUtils.checkBoxColl(kickX, kickY, state.board, getPiece(rot))) {
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

    if(!gameUtils.checkBoxColl(newX, state.playY, state.board, getPiece()))
        state.playX = newX;
}