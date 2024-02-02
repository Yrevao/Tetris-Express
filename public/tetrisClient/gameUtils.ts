import * as draw from './draw.ts';

// color type
export type Color = {
    r: number,
    g: number,
    b: number
}

// grid box type
export type Box = {
    color: Color,
    locked: boolean,
    effect: any
}

// grid type
export type Grid = (Box | null)[][];

// update the contents of all the canvases with data from the passed array
export const updateViews = (views: any) => {
    views.forEach((view) => {
        draw.cls(view.canvas);
        draw.drawGrid(view.viewportW, view.viewportH, view.startX, view.startY, view.board, view.canvas);
    });
}

// box factory
export const newBox = (locked: boolean, color: Color, effect?: any): Box => {
    // color is css color
    // locked tells if the box needs to be moved down by gravity or if it's settled
    // graphical effects applied to the box, mainly changing color a bit to indicate that the box is locking in place
    return {
        color,
        locked,
        effect
    }
}

// box 2d array factory
export const newGrid = (width: number, height: number, filler?: any): Grid => {
    let outGrid: Box[][] = [];

    for (let i = 0; i < width; i++) {
        let row: Box[] | null = [];

        for (let j = 0; j < height; j++) {
            row.push(filler);
        }

        outGrid.push(row);
    }
    
    return outGrid;
}

// color factory
export const newColor = (r: number, g: number, b: number): Color => {
    return {
        r,
        g,
        b
    }
}

// blend colors to make them appear transparent using the over operator
export const applyAlpha = (ca: Color, cb: Color, aa: number, ab: number): Color => {
    let c = newColor(0, 0, 0);
    let a = aa + (ab * (1 - aa));
    const over = (c1, c2) => ((c1*aa) + ((c2*ab) * (1 - aa))) / a;
    
    c.r = 255 * over(ca.r / 255, cb.r / 255);
    c.g = 255 * over(ca.g / 255, cb.g / 255);
    c.b = 255 * over(ca.b / 255, cb.b / 255);

    return c;
}

// place input onto base at x, y
export const stamp = (x: number, y: number, base: Grid, input: Grid): Grid => {
    for(let i = x; i < x + input.length; i++)

        for(let j = y; j < y + input[i-x].length; j++) {

            if(i < base.length && j < base[0].length && i >= 0 && j >= 0) {

                if(base[i][j] == null && input[i-x][j-y] != null)

                    base[i][j] = input[i-x][j-y];
            }
        }
    return base;
}

// recolor blocks in a grid; method arguments: (originalColor) => return newColor
export const recolor = (grid: Grid, method: any): Grid => {
    for(let i in grid) {
        for(let j in grid[i]) {
            let b: Box | null = grid[i][j];

            if(b) {
                b.color = method(b.color);
                grid[i][j] = b;
            }
        }
    }

    return grid;
}

// check if input placed at a given x and y will collide with base
export const checkBoxColl = (x: number, y: number, base: Grid, input: Grid): boolean => {
    // check that the x and y are widthin the base
    if(x < base.length && y < base[0].length) {
        // check if there is a collision widthin the area of the input on the base at x and y
        for(let i = x; i < x + input.length; i++) {

            for(let j = y; j < y + input[0].length; j++) {
                let checkInput = input[i-x][j-y];

                // check in the bounds of the base
                if(i < base.length && j < base[0].length && i >= 0 && j >= 0) {
                    let checkBase = base[i][j];

                    // if there's nothing to hit then go to the next index
                    if(checkBase == null || checkInput == null)
                        continue;

                    // if the input will hit a locked base box then a collision will occour
                    if(checkBase.locked && !checkInput.locked)
                        return true;
                }
                // check if the input part that's out of bounds is empty
                else if(i-x >= 0 && j-y >= 0 && checkInput != null)
                    return true;
            }
        }
        return false;
    }
    return true;
}