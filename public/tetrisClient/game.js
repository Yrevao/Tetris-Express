const gameUtils = require('./gameUtils.js');
const blockStore = require('./blockStore.js');
const draw = require('./draw.js');

// view
const boardW = 10;
const boardH = 40;
let session = null;
let boardCanvas = null;
let holdCanvas = null;
let nextCanvas = null;
let locksScore = null;
let linesScore = null;
let ppsScore = null;
let timeScore = null;
let fpsScore = null;

// gameplay settings
let settings = {
    gravityTime: 500,           // how long the piece in play takes to move down one cell in ms
    levelGravity: 1000 / 5,     // fall speed of current level
    softDropGravity: 1000 / 80, // fall speed of soft drop
    lockDelay: 500              // how long a piece takes to lock after landing in ms
}

// game state
let state = {
    board: gameUtils.newGrid(boardW, boardH),   // game board grid
    bag: [],                                    // main piece bag
    hold: null,                                 // held piece
    held: false,                                // indicates that a piece has been held durring the current play
    playX: 3,                                   // x position of piece in play
    playY: 18,                                  // y position
    playRot: 0,                                 // rotation
    playLandTime: -1,                           // Date.now() of when the piece in play landed 
    playLastGravity: Date.now(),                // Date.now() of when the piece in play last moved down a cell
    loss: false,                                // indicates that the game has been lost
    locks: 0,                                   // total pieces locked
    lines: 0,                                   // total lines cleared
    pps: 0,                                     // pieces per second
    start: Date.now(),                          // Date.now() of when the game started
    frames: 0,                                  // frames per second
    frameTimer: Date.now(),                     // when the current second started
}

// reset state to starting defaults
const resetState = () => {
    state.board = gameUtils.newGrid(boardW, boardH);
    state.bag = [];
    state.hold = null;
    state.held = false;
    state.playX = 3;
    state.playY = 18;
    state.playRot = 0;
    state.playLandTime = -1;
    state.playLastGravity = Date.now();
    state.loss = false;
    state.locks = 0;
    state.lines = 0;
    state.pps = 0;
    state.start = Date.now();
    state.frames = 0;
    state.frameTimer = Date.now();
}

// get the current piece's grid
const getPiece = (rot) => {
    if(rot != null)
        return blockStore.idToLetter[state.bag[0]](rot);

    return blockStore.idToLetter[state.bag[0]](state.playRot);
}

// reset the in play piece's position and metadata to the starting values
const resetPiece = () => {
    state.playX = 3;
    state.playY = 18;
    state.playRot = 0;
    state.playLandTime = -1;
    state.playLastGravity = Date.now();
    state.held = false;
}

// load a new piece after landing
const nextPiece = () => {
    resetPiece();

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
            state.lines++;
            linesScore.textContent = state.lines;
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
    for(let y = state.playY; y < boardH; y++) {
        if(gameUtils.checkBoxColl(state.playX, y, state.board, getPiece()))
            return y - 1;
    }
}

// called when the game is lost due to pieces being placed outside of the visible board
const onLoss = () => {
    state.loss = true;

    const lossColor = gameUtils.newColor(64, 64, 64);
    gameUtils.recolor(state.board, () => lossColor);
}

// ran when a piece is locked after landing
const lockPlay = () => {
    gameUtils.stamp(state.playX, state.playY, state.board, getPiece());
    clearPlay(true);
    clearLines();

    // check for loss
    if(gameUtils.checkBoxColl(0, 0, state.board, gameUtils.newGrid(boardW, 20, gameUtils.newBox(false))))
        onLoss();
    else {
        // update total locked pieces and plays per second
        state.locks++;
        locksScore.textContent = state.locks;

        const duration = Date.now() - state.start;
        ppsScore.textContent = (state.locks / (duration / 1000)).toFixed(2);

        // spawn next piece
        nextPiece();
    }

    session.stateUpdate(state.board, state.loss);
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

    gameUtils.recolor(ghost, (color) =>
        gameUtils.applyAlpha(color, gameUtils.newColor(0, 0, 0), 0.8, 1));

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

// return min:sec:ms of how long the game has been running
const formatPlayTime = () => {
    const duration = Date.now() - state.start;
    const sec = Math.floor(duration / 1000);
    const min = Math.floor(sec / 60);

    return `${min}:${sec % 60}:${duration % 1000}`;
}

// return frames per second
const formatFps = () => {
    // how many seconds have passed since the last fps check
    const second = (Date.now() - state.frameTimer) / 1000;
    // frames per second average since the last time fps was checked
    const fps = state.frames / second;

    // how much second has passed since a full second after the last fps check
    const secondDiff = second - 1; 
    if(secondDiff > 0) {
        // adjust frame timer so that {const second} is widthin 1 second
        state.frameTimer += secondDiff * 1000;
        // adjust frame count to 1 seconds worth of frames
        state.frames -= fps / (1 / secondDiff);
    }

    return fps.toFixed(1);
}

// init objects
export const init = (initSession) => {
    session = initSession;

    // setup canvases
    const root = document.getElementById('root');
    holdCanvas = draw.newPlayfieldCanvas(400, 200, '4vh', 'holdCanvas', root);
    boardCanvas = draw.newPlayfieldCanvas(1000, 2000, '40vh', 'boardCanvas', root);
    nextCanvas = draw.newPlayfieldCanvas(400, 1400, '28vh', 'holdCanvas', root);

    // setup score display
    const scoreBoard = document.createElement('div');
    scoreBoard.innerHTML = `
        <span># </span><span id="locks">${state.locks}</span>
        <br>
        <span>Lines </span><span id="lines">${state.lines}</span>
        <br>
        <span>PPS </span><span id="pps">${state.pps}</span>
        <br>
        <span>Time </span><span id="time">${formatPlayTime()}</span>
        <br>
        <span>FPS </span><span id="fps"><${formatFps()}</span>
    `
    root.appendChild(scoreBoard);

    locksScore = document.getElementById('locks');
    linesScore = document.getElementById('lines');
    ppsScore = document.getElementById('pps');
    timeScore = document.getElementById('time');
    fpsScore = document.getElementById('fps');
}

// prepare game for tick cycle
export const start = async () => {
    resetState();

    locksScore.textContent = 0;
    linesScore.textContent = 0;
    ppsScore.textContent = 0;
    timeScore.textContent = formatPlayTime();
    fpsScore.textContent = formatFps();

    // request bags until there's enough pieces
    while(state.bag.length < 14) {
        await session.requestBag()
            .then(nextBag => {
                state.bag = state.bag.concat(nextBag);
            });
    }
}

// event methods, controls and SocketIO events
export const events = {
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
            return;

        state.playY = dropPlay();
        clearPlay(false);
        lockPlay();
    },
    hold: (k) => {
        if(!k.down || state.held)
            return;

        if(state.hold == null) {
            state.hold = state.bag[0];
            nextPiece();
            state.held = true;
        }
        else {
            const buffer = state.hold;
            state.hold = state.bag[0];
            state.bag[0] = buffer;
            resetPiece();
            state.held = true;
        }
    },
}

// run one update cycle
export const tick = () => {
    // update board if the game hasn't been lost
    if(!state.loss) {
        doGravity();
        placeGhost();
        state.frames++;
        fpsScore.textContent = formatFps();
        timeScore.textContent = formatPlayTime();
    }
}

// return canvas and state info for updating graphics
export const getViews = () => {
    // generate hold grid based on if a piece is being held
    let holdGrid = gameUtils.newGrid(4, 2);
    if(state.hold != null)
        holdGrid = gameUtils.stamp(0, 0, holdGrid, blockStore.idToLetter[state.hold](0));
    // generate next grid
    let nextGrid = gameUtils.newGrid(4, 14);
    for(let i = 0; i < 5; i++)
        gameUtils.stamp(0, i*3, nextGrid, blockStore.idToLetter[state.bag[1+i]](0));

    // define views
    const gameView = draw.newView(10, 20, 0, 20, state.board, boardCanvas);
    const holdView = draw.newView(4, 2, 0, 0, holdGrid, holdCanvas);
    const nextView = draw.newView(4, 14, 0, 0, nextGrid, nextCanvas);

    return [gameView, holdView, nextView];
}