const draw = require('./draw.js');
const model = require('./model.js');

// begin match setup process for user
export const setup = (playfieldCanvas) => {
    model.init(playfieldCanvas);

    tickLoop();
}

// gameplay loop
const tickLoop = () => {
    setTimeout(() => {
        model.tick();
        updateCanvases([model.getGameView()]);

        tickLoop();
    }, 100);
}

// update the contents of all the canvases in the passed array
const updateCanvases = (games) => {
    games.forEach((game) => {
        draw.cls(game.canvas);
        draw.drawBoard(game.board, game.maxY, game.canvas);
    })
}