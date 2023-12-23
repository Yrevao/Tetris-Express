const utils = require('./gameUtils.js');

// view objects
export const newView = (viewW, viewH, x, y, grid, targetCanvas) => {
    return {
        viewportW: viewW,
        viewportH: viewH,
        startX: x,
        startY: y,
        board: grid,
        canvas: targetCanvas
    }
}

// create a new canvas element for a tetris board
export const newPlayfieldCanvas = (width, height, scale, canvasId, parentNode) => {
    // canvas dom node
    const playfield = document.createElement('canvas');
    playfield.id = canvasId;
    playfield.width = width;
    playfield.height = height;
    playfield.style = `height: ${scale}`;
    parentNode.appendChild(playfield);
    
    return playfield;
}

// draw block on tetris board
export const drawBlock = (x, y, gridW, gridH, c, playfieldCanvas) => {
    let ctx = playfieldCanvas.getContext("2d");
    ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;

    // scale the block to the board
    let sizeCoefX = playfieldCanvas.width / gridW;
    let sizeCoefY = playfieldCanvas.height / gridH;

    // draw block if the coords are in range
    if(x < 10 && y < 20 && x >= 0 && y >= 0)
        ctx.fillRect(x * sizeCoefX, y * sizeCoefY, sizeCoefX, sizeCoefY);
}

// draw all the box objects from a grid on a canvas
export const drawGrid = (viewportW, viewportH, startX, startY, grid, canvas) => {
    for(let x = startX; x < startX + viewportW && x < grid.length; x++) {
        for(let y = startY; y < startY + viewportH && y < grid[0].length; y++) {
            const block = grid[x][y];
            if(block != null)
                drawBlock(x - startX, y - startY, viewportW, viewportH, block.color, canvas);
        }
    }
}

// clear the visible screen
export const cls = (playfieldCanvas) => {
    let ctx = playfieldCanvas.getContext("2d");
    ctx.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height);
}