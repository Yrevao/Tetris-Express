// used to store grids for i, j, l, o, s, t, z blocks with 4 rotations hardcoded, also provides id to color/letter arrays
import * as utils from './gameUtils.tsx';

// super rotation system (SRS) wall kick tables
const kickMatrix: Map<string, number[][]> = new Map([
    ['01', [ [0,0],[-1,0],[-1,1],[0,-2],[-1,-2] ] ],
    ['10', [ [0,0],[1,0],[1,-1],[0,2],[1,2]     ] ],
    ['12', [ [0,0],[1,0],[1,-1],[0,2],[1,2]     ] ],
    ['21', [ [0,0],[-1,0],[-1,1],[0,-2],[-1,-2] ] ],
    ['23', [ [0,0],[1,0],[1,1],[0,-2],[1,-2]    ] ],
    ['32', [ [0,0],[-1,0],[-1,-1],[0,2],[-1,2]  ] ],
    ['30', [ [0,0],[-1,0],[-1,-1],[0,2],[-1,2]  ] ],
    ['03', [ [0,0],[1,0],[1,1],[0,-2],[1,-2]    ] ],
]);
const iKickMatrix: Map<string, number[][]> = new Map([
    ['01', [ [0,0],[-2,0],[1,0],[-2,-1],[1,2]   ] ],
    ['10', [ [0,0],[2,0],[-1,0],[2,1],[-1,-2]   ] ],
    ['12', [ [0,0],[-1,0],[2,0],[-1,2],[2,-1]   ] ],
    ['21', [ [0,0],[1,0],[-2,0],[1,-2],[-2,1]   ] ],
    ['23', [ [0,0],[2,0],[-1,0],[2,1],[-1,-2]   ] ],
    ['32', [ [0,0],[-2,0],[1,0],[-2,-1],[1,2]   ] ],
    ['30', [ [0,0],[1,0],[-2,0],[1,-2],[-2,1]   ] ],
    ['03', [ [0,0],[-1,0],[2,0],[-1,2],[2,-1]   ] ],
]);

// get a set of kicks based on if the piece is an I piece and the rotation being performed
export const getKickData = (minoId: number, startRot: number, endRot: number): number[][] => {
    const rotState: string = `${startRot}${endRot}`;
    const kickArr: number[][] | undefined = 
        minoId == 0 ? iKickMatrix.get(rotState) : kickMatrix.get(rotState);
    
    // if the rotation doesn't exist don't kick
    return kickArr ? kickArr : [[0,0]];
}

export const i = (rot: number): utils.Grid => {
    let color: utils.Color = idToColor[0];
    let block: utils.Grid = utils.newGrid(4, 4);
    const blockBox: utils.Box = utils.newBox(false, color);
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
    let color: utils.Color = idToColor[1];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
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
    let color: utils.Color = idToColor[2];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
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
    let color: utils.Color = idToColor[3];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
    block[1][0] = blockBox;
    block[2][0] = blockBox;
    block[1][1] = blockBox;
    block[2][1] = blockBox;
    return block;
}
export const s = (rot: number): utils.Grid => {
    let color: utils.Color = idToColor[4];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
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
    let color: utils.Color = idToColor[5];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
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
    let color: utils.Color = idToColor[6];
    let block: utils.Grid = utils.newGrid(3, 3);
    const blockBox: utils.Box = utils.newBox(false, color);
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

export const idToLetter: Function[] = [i, j, l, o, s, t, z];
export const idToColor: utils.Color[] = [utils.newColor(0,255,255), utils.newColor(0,0,255), utils.newColor(255,170,0), utils.newColor(255,255,0), utils.newColor(0,255,0), utils.newColor(153,0,254), utils.newColor(255,0,0)];