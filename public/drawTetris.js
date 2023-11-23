// viewport canvas dimensions
export const canvasSizeX = 1000;
export const canvasSizeY = 2000;
export const playfieldSizeX = 10;
export const playfieldSizeY = 20;

// draws a block on the 10x20 tetris board
export const drawBlock = (x, y, c) => {
    let playfieldCanvas = document.getElementById("board");
    let ctx = playfieldCanvas.getContext("2d");
    ctx.fillStyle = c;

    // scale the block to the board
    let sizeCoefX = canvasSizeX / playfieldSizeX;
    let sizeCoefY = canvasSizeY / playfieldSizeY;

    // draw block if the coords are in range
    if(x < 10 && y < 20 && x >= 0 && y >= 0)
        ctx.fillRect(x * sizeCoefX, y * sizeCoefY, sizeCoefX, sizeCoefY);
}

// clear the visible screen
export const cls = () => {
    let playfieldCanvas = document.getElementById("board");
    let ctx = playfieldCanvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSizeX, canvasSizeY);
}