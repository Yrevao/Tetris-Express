import * as gameUtils from './gameUtils.ts';
import * as blockStore from './blockStore.ts';
import * as draw from './draw.ts';
import * as input from './input.ts'
// shared objects
let session: any | null = null;
// canvas config and data
let view: {
    boardW: number,                         // width of game board grid
    boardH: number,                         // height of game board grid
    boardCanvas: HTMLCanvasElement | null,  // DOM element of the game board display canvas
    holdCanvas: HTMLCanvasElement | null,   // DOM element for the hold display canvas
    nextCanvas: HTMLCanvasElement | null,   // DOM element for the next piece display canvas
} = {
    boardW: 10,
    boardH: 40,
    boardCanvas: null,
    holdCanvas: null,
    nextCanvas: null,
}
// scoreboard data
let scores: {
    usernameScore: HTMLSpanElement | null,  // player's username
    locksScore: HTMLSpanElement | null,     // total pieces placed on the board
    linesScore: HTMLSpanElement | null,     // number of line clears
    ppsScore: HTMLSpanElement | null,       // pieces placed per second
    timeScore: HTMLSpanElement | null,      // how long the game has been running in format "min:sec:ms"
} = {
    usernameScore: null,
    locksScore: null,
    linesScore: null,
    ppsScore: null,
    timeScore: null,
}
// gameplay settings
let settings: {
    levelGravity: number,                   // fall speed of current level
    softDropGravity: number,                // fall speed of soft drop
    lockDelay: number                       // how long a piece takes to lock after landing in ms
} = {
    levelGravity: 1000 / 5,
    softDropGravity: 1000 / 80,
    lockDelay: 500
}
// game state
let state: {
    board:              gameUtils.Grid,     // game board grid
    bag:                number[],           // main piece bag
    hold:               number | null,      // held piece
    held:               boolean,            // indicates that a piece has been held durring the current play
    playX:              number,             // x position of piece in play
    playY:              number,             // y position
    playRot:            number,             // rotation
    gravityTime:        number | null,      // how long the piece in play takes to move down one cell in ms
    playLandTime:       number,             // Date.now() of when the piece in play landed 
    playLastGravity:    number,             // Date.now() of when the piece in play last moved down a cell
    loss:               boolean,            // indicates that the game has been lost
    locks:              number,             // total pieces locked
    lines:              number,             // total lines cleared
    pps:                number,             // pieces per second
    start:              number,             // Date.now() of when the game started
    paused:             boolean,            // if the game is running or not
    pauseTime:          number,             // time when the game was paused
} = {
    board: gameUtils.newGrid(view.boardW, view.boardH),
    bag: [],
    hold: null,
    held: false,
    playX: 3,
    playY: 18,
    playRot: 0,
    gravityTime: null,
    playLandTime: -1,
    playLastGravity: Date.now(),
    loss: false,
    locks: 0,
    lines: 0,
    pps: 0,
    start: Date.now(),
    paused: false,
    pauseTime: Date.now(),
};

// reset state to starting defaults
const resetState = () => {
    state.board = gameUtils.newGrid(view.boardW, view.boardH);
    state.bag = [];
    state.hold = null;
    state.held = false;
    state.playX = 3;
    state.playY = 18;
    state.playRot = 0;
    state.gravityTime = null;
    state.playLandTime = -1;
    state.playLastGravity = Date.now();
    state.loss = false;
    state.locks = 0;
    state.lines = 0;
    state.pps = 0;
    state.start = Date.now();
    state.paused = false;
    state.pauseTime = Date.now();
}

// get the current piece's grid
const getPiece = (rot?: number | null): gameUtils.Grid => {
    return blockStore.idToLetter[state.bag[0]](rot == null ? state.playRot : rot);
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
    if(state.bag.length <= 21) {
        session.requestBag()
            .then((nextBag: number[]) => {
                state.bag = state.bag.concat(nextBag);
            });
    }
    state.bag.shift();
}

// clear the piece currently being played, or lock it
const clearPlay = (lock: boolean) => {
    for(let i = 0; i < state.board.length; i++) {

        for(let j = 0; j < state.board[0].length; j++) {
            let aBox: gameUtils.Box | null = state.board[i][j];

            if(aBox && !aBox.locked) {
                if(lock)
                    aBox.locked = true;
                else
                    aBox = null;

                state.board[i][j] = aBox;
            }
        }
    }
}

// when a row is completely full of locked cells clear that row and shift everything above down one
const clearLines = () => {
    for(let row = 0; row < state.board[0].length; row++) {
        let rowFull: boolean = true;
        // if a cell in the row is empty then the row is not full
        for(let col = 0; rowFull && col < state.board.length; col++) {
            if(state.board[col][row] == null)
                rowFull = false;
        }

        // move everything above the current row down one if the row is full
        if(rowFull) {
            state.lines++;
            setScore(scores.linesScore, state.lines);
            for(let r = row; r > 0; r--) {
                for(let c = 0; c < state.board.length; c++) {
                    state.board[c][r] = structuredClone(state.board[c][r - 1]);
                }
            }
        }
    }
}

// find the lowest y value the in play piece can drop to without hitting anything
const dropPlay = (max?: number): number => {
    const maxY: number = max ? max + 1 : view.boardH

    for(let y = state.playY; y < maxY; y++) {
        if(gameUtils.checkBoxColl(state.playX, y, state.board, getPiece()))
            return y - 1;
    }

    return maxY - 1;
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
    if(gameUtils.checkBoxColl(0, 0, state.board, gameUtils.newGrid(view.boardW, 20, gameUtils.newBox(false, gameUtils.newColor(0,0,0)))))
        onLoss();
    else {
        // update total locked pieces and plays per second
        state.locks++;
        setScore(scores.locksScore, state.locks);

        const duration = Date.now() - state.start;
        setScore(scores.ppsScore, (state.locks / (duration / 1000)).toFixed(2));

        // spawn next piece
        nextPiece();
    }

    session.stateUpdate(state.board, state.loss);
}

// move all not locked blocks in the grid down one
const doGravity = () => {
    // null checks
    if(!state.gravityTime)
        return;

    clearPlay(false);

    // how far to move a piece
    let gravityDebt = Math.floor((Date.now() - state.playLastGravity) / state.gravityTime);

    // check if enought time has passed to move the piece down
    if(gravityDebt >= 1) {
        const newY: number = dropPlay(state.playY + gravityDebt);
        state.playLastGravity = Date.now();

        // check if piece can drop without collision
        if(newY - state.playY > 0) {
            state.playLandTime = -1;
            state.playY = newY;
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
    const kickData: number[][] = blockStore.getKickData(state.bag[0], state.playRot, rot);

    for(let kick of kickData) {
        const kickX: number = state.playX + kick[0];
        const kickY: number = state.playY + kick[1];

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
    let newX: number = state.playX + dx;
    let newRot: number = state.playRot + drot;

    // clamp rotation
    newRot = newRot % 4;

    // update state with new values if theres no colision
    if(drot != 0)
        kick(newRot);

    if(!gameUtils.checkBoxColl(newX, state.playY, state.board, getPiece()))
        state.playX = newX;
}

// return min:sec:ms of how long the game has been running
const formatPlayTime = (time?: number, start?: number): string => {
    state.start = (start ? start : state.start);
    let duration: number = Date.now() - state.start;
    if(time)
        duration = time;

    const sec: number = Math.floor(duration / 1000);
    const min: number = Math.floor(sec / 60);

    return `${min}:${sec % 60}:${duration % 1000}`;
}

// set scoreboard dom element to a value
const setScore = (score: HTMLSpanElement | null, value: number | string) => {
    if(score)
        score.textContent = value.toString();
}

// event methods, controls and SocketIO events
export const events = {
    left: (k: input.KeyState) => {
        if(k.down)
            move(-1, 0);
    },
    right: (k: input.KeyState) => {
        if(k.down)
            move(1, 0);
    },
    rotLeft: (k: input.KeyState) => {
        if(k.down)
            move(0, 3);
    },
    rotRight: (k: input.KeyState) => {
        if(k.down)
            move(0, 1);
    },
    rot180: (k: input.KeyState) => {
        if(!k.down)
            return;
        
        move(0, 1);
        move(0, 1);
    },
    softDrop: (k: input.KeyState) => {
        const oldTime = state.gravityTime;
        state.gravityTime = k.down ? settings.softDropGravity : settings.levelGravity;

        // null checks
        if(!state.gravityTime || !oldTime)
            return;
        
        // difference factor between the set gravity and previous gravity
        const timeCoef = state.gravityTime / oldTime;
        // scaled time since the last gravity tick
        const gravityTimeScaled = (Date.now() - state.playLastGravity) * timeCoef;
        // scaled time at the last gravity tick
        state.playLastGravity = Date.now() - gravityTimeScaled;
    },
    hardDrop: (k: input.KeyState) => {
        if(!k.down)
            return;

        state.playY = dropPlay();
        clearPlay(false);
        lockPlay();
    },
    hold: (k: input.KeyState) => {
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
    }
}

// init objects
export const init = (initSession: any) => {
    session = initSession;

    let root = document.getElementById('root');
    if(!root)
        return;

    // setup canvases
    let gameBoardsDiv = document.createElement('div');
    gameBoardsDiv.id = 'game';
    root.appendChild(gameBoardsDiv);

    view.holdCanvas = draw.newPlayfieldCanvas(400, 200, '4vh', 'holdCanvas', gameBoardsDiv);
    view.boardCanvas = draw.newPlayfieldCanvas(1000, 2000, '40vh', 'boardCanvas', gameBoardsDiv);
    view.nextCanvas = draw.newPlayfieldCanvas(400, 1400, '28vh', 'nextCanvas', gameBoardsDiv);

    // setup score display
    const scoreBoard = document.createElement('div');
    scoreBoard.id = 'scoreboard';
    scoreBoard.innerHTML = `
        <span id="usernameScore">none</span>
        <br>
        <span># </span><span id="locks">${state.locks}</span>
        <br>
        <span>Lines </span><span id="lines">${state.lines}</span>
        <br>
        <span>PPS </span><span id="pps">${state.pps}</span>
        <br>
        <span>Time </span><span id="time">${formatPlayTime(0, Date.now())}</span>
    `
    root.appendChild(scoreBoard);

    scores.usernameScore = document.getElementById('usernameScore');
    scores.locksScore = document.getElementById('locks');
    scores.linesScore = document.getElementById('lines');
    scores.ppsScore = document.getElementById('pps');
    scores.timeScore = document.getElementById('time');
}

// prepare game for tick cycle
export const start = async (startSettings: any) => {
    // request bags until there's enough pieces
    let initBag: number[] = []
    while(initBag.length < 28) {
        await session.requestBag()
            .then((nextBag: any) => {
                initBag = initBag.concat(nextBag);
            });
    }

    // reset state after requesting bags so that all Date.now() properties are set without latency
    resetState();
    state.bag = initBag;

    setScore(scores.locksScore, 0);
    setScore(scores.linesScore, 0);
    setScore(scores.ppsScore, 0);
    setScore(scores.timeScore, formatPlayTime(0, Date.now()));

    settings = startSettings;
    state.gravityTime = settings.levelGravity;
}

// run one update cycle
export const tick = () => {
    // update board if the game hasn't been lost or is paused
    if(!state.loss && !state.paused) {
        doGravity();
        placeGhost();
        setScore(scores.timeScore, formatPlayTime());
    }
}

// return canvas and state info for updating graphics
export const getViews = (): draw.View[] => {
    // check that canvases are defined
    if(!view.boardCanvas || !view.holdCanvas || !view.nextCanvas)
        return [];

    // generate hold grid based on if a piece is being held
    let holdGrid: gameUtils.Grid = gameUtils.newGrid(4, 2);
    if(state.hold != null)
        holdGrid = gameUtils.stamp(0, 0, holdGrid, blockStore.idToLetter[state.hold](0));
    // generate next grid
    let nextGrid: gameUtils.Grid = gameUtils.newGrid(4, 14);
    for(let i = 0; i < 5; i++)
        gameUtils.stamp(0, i*3, nextGrid, blockStore.idToLetter[state.bag[1+i]](0));

    // define views
    const gameView: draw.View = draw.newView(10, 20, 0, 20, state.board, view.boardCanvas);
    const holdView: draw.View = draw.newView(4, 2, 0, 0, holdGrid, view.holdCanvas);
    const nextView: draw.View = draw.newView(4, 14, 0, 0, nextGrid, view.nextCanvas);

    return [gameView, holdView, nextView];
}

// change the username stored in the game state
export const updateUsername = (name: string) => {
    setScore(scores.usernameScore, name);
}

// set the pause state of the game, resync time when the game is unpaused
export const pause = (paused: boolean) => {
    state.paused = paused;

    if(paused)
        state.pauseTime = Date.now();
    else {
        // how long the game has been paused for in ms
        let pauseTime: number = Date.now() - state.pauseTime;
        // update timers to account for the time gap when paused
        state.playLastGravity += pauseTime;
        state.start += pauseTime;
    }
}