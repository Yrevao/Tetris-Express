// used to store grids for i, j, l, o, s, t, z blocks with 4 rotations hardcoded, also provides id to color/letter arrays
import * as utils from './utilityTetris.js';

export const i = (rot) => {
    let block = utils.newGrid(4, 4);
    const blockBox = utils.newBox(false, utils.newColor(0,255,255), null);
    switch(rot) {
        case 0:
                block[0][1] = blockBox;
                block[1][1] = blockBox;
                block[2][1] = blockBox;
                block[3][1] = blockBox;
            break;
        case 1:
                block[2][0] = blockBox;
                block[2][1] = blockBox;
                block[2][2] = blockBox;
                block[2][3] = blockBox;
            break;
        case 2:
                block[0][2] = blockBox;
                block[1][2] = blockBox;
                block[2][2] = blockBox;
                block[3][2] = blockBox;
            break;
        case 3:
                block[1][0] = blockBox;
                block[1][1] = blockBox;
                block[1][2] = blockBox;
                block[1][3] = blockBox;
            break;
    }
    return block;
}
export const j = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(0,0,255), null);
    block[1][1] = blockBox;
    switch(rot) {
        case 0:
                block[0][0] = blockBox;
                block[0][1] = blockBox;
                block[2][1] = blockBox;
            break;
        case 1:
                block[1][0] = blockBox;
                block[2][0] = blockBox;
                block[1][2] = blockBox;
            break;
        case 2:
                block[0][1] = blockBox;
                block[2][1] = blockBox;
                block[2][2] = blockBox;
            break;
        case 3:
                block[1][0] = blockBox;
                block[0][2] = blockBox;
                block[1][2] = blockBox;
            break;
    }
    return block;
}
export const l = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(255,170,0), null);
    block[1][1] = blockBox;
    switch(rot) {
        case 0:
                block[2][0] = blockBox;
                block[0][1] = blockBox;
                block[2][1] = blockBox;
            break;
        case 1:
                block[1][0] = blockBox;
                block[2][2] = blockBox;
                block[1][2] = blockBox;
            break;
        case 2:
                block[0][1] = blockBox;
                block[2][1] = blockBox;
                block[0][2] = blockBox;
            break;
        case 3:
                block[1][0] = blockBox;
                block[0][0] = blockBox;
                block[1][2] = blockBox;
            break;
    }
    return block;
}
export const o = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(255,255,0), null);
    block[1][0] = blockBox;
    block[2][0] = blockBox;
    block[1][1] = blockBox;
    block[2][1] = blockBox;
    return block;
}
export const s = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(0,255,0), null);
    block[1][1] = blockBox;
    switch(rot) {
        case 0:
                block[1][0] = blockBox;
                block[2][0] = blockBox;
                block[0][1] = blockBox;
            break;
        case 1:
                block[1][0] = blockBox;
                block[2][1] = blockBox;
                block[2][2] = blockBox;
            break;
        case 2:
                block[0][2] = blockBox;
                block[1][2] = blockBox;
                block[2][1] = blockBox;
            break;
        case 3:
                block[0][0] = blockBox;
                block[0][1] = blockBox;
                block[1][2] = blockBox;
            break;
    }
    return block;
}
export const t = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(153,0,254), null);
    block[1][1] = blockBox;
    switch(rot) {
        case 0:
                block[1][0] = blockBox;
                block[0][1] = blockBox;
                block[2][1] = blockBox;
            break;
        case 1:
                block[1][0] = blockBox;
                block[2][1] = blockBox;
                block[1][2] = blockBox;
            break;
        case 2:
                block[0][1] = blockBox;
                block[2][1] = blockBox;
                block[1][2] = blockBox;
            break;
        case 3:
                block[1][0] = blockBox;
                block[0][1] = blockBox;
                block[1][2] = blockBox;
            break;
    }
    return block;
}
export const z = (rot) => {
    let block = utils.newGrid(3, 3);
    const blockBox = utils.newBox(false, utils.newColor(255,0,0), null);
    block[1][1] = blockBox;
    switch(rot) {
        case 0:
                block[0][0] = blockBox;
                block[1][0] = blockBox;
                block[2][1] = blockBox;
            break;
        case 1:
                block[2][0] = blockBox;
                block[2][1] = blockBox;
                block[1][2] = blockBox;
            break;
        case 2:
                block[0][1] = blockBox;
                block[2][2] = blockBox;
                block[1][2] = blockBox;
            break;
        case 3:
                block[1][0] = blockBox;
                block[0][1] = blockBox;
                block[0][2] = blockBox;
            break;
    }
    return block;
}

export const idToLetter = [i, j, l, o, s, t, z];
export const idToColor = [utils.newColor(0,255,255), utils.newColor(0,0,255), utils.newColor(255,170,0), utils.newColor(255,255,0), utils.newColor(0,255,0), utils.newColor(153,0,254), utils.newColor(255,0,0)];