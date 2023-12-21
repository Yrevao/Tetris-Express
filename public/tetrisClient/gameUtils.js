const draw = require('./draw.js');

// update the contents of all the canvases in the passed array
export const updateCanvases = (games) => {
    games.forEach((game) => {
        draw.cls(game.canvas);
        draw.drawBoard(game.board, game.maxY, game.canvas);
    })
}

// box factory
export const newBox = (locked, color, effect) => {
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
export const newGrid = (rows, cols) => {
    let outGrid = [];

    for (let i = 0; i < rows; i++) {
        let row = [];

        for (let j = 0; j < cols; j++) {
            row.push(null);
        }

        outGrid.push(row);
    }
    
    return outGrid;
}

// color factory
export const newColor = (r, g, b) => {
    return {
        r,
        g,
        b
    }
}

// place input onto base at x, y
export const stamp = (x, y, base, input) => {
    for(let i = x; i < x + input.length; i++)

        for(let j = y; j < y + input[i-x].length; j++) {

            if(i < base.length && j < base[0].length && i >= 0 && j >= 0) {

                if(base[i][j] == null && input[i-x][j-y] != null)

                    base[i][j] = input[i-x][j-y];
            }
        }
    return base;
}

// check if input placed at a given x and y will collide with base
export const checkBoxColl = (x, y, base, input) => {
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