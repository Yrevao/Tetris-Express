// used to store grids for i, j, l, o, s, t, z blocks with 4 rotations hardcoded, also provides id to color/letter arrays
import * as utils from './gameUtils.ts';

// super rotation system (SRS) wall kick tables
const kickMatrix: any = {
    '01': [ [0,0],[-1,0],[-1,1],[0,-2],[-1,-2] ],
    '10': [	[0,0],[1,0],[1,-1],[0,2],[1,2] ],
    '12': [ [0,0],[1,0],[1,-1],[0,2],[1,2] ],
    '21': [ [0,0],[-1,0],[-1,1],[0,-2],[-1,-2] ],
    '23': [ [0,0],[1,0],[1,1],[0,-2],[1,-2] ],
    '32': [ [0,0],[-1,0],[-1,-1],[0,2],[-1,2] ],
    '30': [ [0,0],[-1,0],[-1,-1],[0,2],[-1,2] ],
    '03': [ [0,0],[1,0],[1,1],[0,-2],[1,-2] ]
}
const iKickMatrix: any = {
    '01': [ [0,0],[-2,0],[1,0],[-2,-1],[1,2] ],
    '10': [ [0,0],[2,0],[-1,0],[2,1],[-1,-2] ],
    '12': [ [0,0],[-1,0],[2,0],[-1,2],[2,-1] ],
    '21': [ [0,0],[1,0],[-2,0],[1,-2],[-2,1] ],
    '23': [ [0,0],[2,0],[-1,0],[2,1],[-1,-2] ],
    '32': [ [0,0],[-2,0],[1,0],[-2,-1],[1,2] ],
    '30': [ [0,0],[1,0],[-2,0],[1,-2],[-2,1] ],
    '03': [ [0,0],[-1,0],[2,0],[-1,2],[2,-1] ]
}

// get a set of kicks based on if the piece is an I piece and the rotation being performed
export const getKickData = (minoId: number, startRot: number, endRot: number): number[][] => {
    const rotState: string = `${startRot}${endRot}`;

    if(minoId == 0)
        return iKickMatrix[rotState];

    return kickMatrix[rotState];
}

export const i = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(4, 4);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(0,255,255));
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
export const j = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(0,0,255));
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
export const l = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(255,170,0));
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
export const o = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(255,255,0));
    block[1][0] = blockBox;
    block[2][0] = blockBox;
    block[1][1] = blockBox;
    block[2][1] = blockBox;
    return block;
}
export const s = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(0,255,0));
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
export const t = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(153,0,254));
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
export const z = (rot: number): utils.Grid => {
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, utils.newColor(255,0,0));
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

export const idToLetter: any[] = [i, j, l, o, s, t, z];
export const idToColor: utils.Color[] = [utils.newColor(0,255,255), utils.newColor(0,0,255), utils.newColor(255,170,0), utils.newColor(255,255,0), utils.newColor(0,255,0), utils.newColor(153,0,254), utils.newColor(255,0,0)];