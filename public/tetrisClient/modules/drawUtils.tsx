import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as utils from './gameUtils.tsx';

// view type
export type View = {
    viewportW: number,
    viewportH: number,
    startX: number,
    startY: number,
    grid: utils.Grid
}

// view objects
export const newView = (viewW: number, viewH: number, x: number, y: number, grid: utils.Grid): View => {
    return {
        viewportW: viewW,
        viewportH: viewH,
        startX: x,
        startY: y,
        grid: grid
    }
}

// create a new canvas element for a tetris board
export const newPlayfieldCanvas = (width: number, height: number, scale: string, canvasId: string, parentNode: HTMLElement): HTMLCanvasElement => {
    // canvas dom node
    const playfield = document.createElement('canvas');
    playfield.id = canvasId;
    playfield.width = width;
    playfield.height = height;
    playfield.style.height = scale;
    parentNode.appendChild(playfield);
    
    return playfield;
}

// draw block on tetris board
export const drawBlock = (x: number, y: number, gridW: number, gridH: number, c: utils.Color, playfieldCanvas: HTMLCanvasElement) => {
    let ctx = playfieldCanvas.getContext("2d");
    if(!ctx)
        return;

    ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;

    // scale the block to the board
    let sizeCoefX = playfieldCanvas.width / gridW;
    let sizeCoefY = playfieldCanvas.height / gridH;

    // draw block if the coords are in range
    if(x < 10 && y < 20 && x >= 0 && y >= 0)
        ctx.fillRect(x * sizeCoefX, y * sizeCoefY, sizeCoefX, sizeCoefY);
}

// draw all the box objects from a grid on a canvas
export const drawGrid = (view: View, canvas?: HTMLCanvasElement | null) => {
    if(!canvas)
        return;

    for(let x = view.startX; x < view.startX + view.viewportW && x < view.grid.length; x++) {
        for(let y = view.startY; y < view.startY + view.viewportH && y < view.grid[0].length; y++) {
            const block = view.grid[x][y];
            if(block != null)
                drawBlock(x - view.startX, y - view.startY, view.viewportW, view.viewportH, block.color, canvas);
        }
    }
}

// clear the visible screen
export const cls = (playfieldCanvas: HTMLCanvasElement) => {
    let ctx = playfieldCanvas.getContext("2d");
    if(!ctx)
        return;

    ctx.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height);
}