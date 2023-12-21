const utils = require('./utility.js');

// viewport canvas dimensions
export const playfieldSizeX = 10;
export const playfieldSizeY = 20;

// create a new canvas element for a tetris board
export const newPlayfieldCanvas = (width, height, scale, canvasId, parentNode) => {
    // canvas dom node
    const playfield = document.createElement('canvas');
    playfield.id = canvasId;
    playfield.width = width;
    playfield.height = height;
    playfield.style = `height: ${scale};`;
    parentNode.appendChild(playfield);
    
    return playfield;
}

// draw block on tetris board
export const drawBlock = (x, y, c, playfieldCanvas) => {
    let ctx = playfieldCanvas.getContext("2d");
    ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;

    // scale the block to the board
    let sizeCoefX = playfieldCanvas.width / playfieldSizeX;
    let sizeCoefY = playfieldCanvas.height / playfieldSizeY;

    // draw block if the coords are in range
    if(x < 10 && y < 20 && x >= 0 && y >= 0)
        ctx.fillRect(x * sizeCoefX, y * sizeCoefY, sizeCoefX, sizeCoefY);
}

// draw the board
export const drawBoard = (board, boardMaxY, playfieldCanvas) => {
    for(let x = 0; x < playfieldSizeX; x++) {
        for(let y = 0; y < playfieldSizeY; y++) {
            let theBlock = board[x][y + (boardMaxY - playfieldSizeY)];
            if(theBlock != null)
                drawBlock(x, y, theBlock.color, playfieldCanvas);
        }
    }
}

// clear the visible screen
export const cls = (playfieldCanvas) => {
    let ctx = playfieldCanvas.getContext("2d");
    ctx.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height);
}