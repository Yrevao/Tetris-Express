const draw = require('./draw.js');
const model = require('./model.js');

// begin match setup process for user
export const setup = (playfieldCanvas) => {
    model.init(playfieldCanvas);

    tickLoop();
}

// keystoke capture
document.addEventListener('keydown', (event) => {
    model.move(event.key, true);
});

document.addEventListener('keyup', (event) => {
    model.move(event.key, false);
});

// gameplay loop
const tickLoop = () => {
    setTimeout(() => {
        model.tick();
        updateCanvases([model.getGameView()]);

        tickLoop();
    }, 500);
}

// update the contents of all the canvases in the passed array
const updateCanvases = (games) => {
    games.forEach((game) => {
        draw.cls(game.canvas);
        draw.drawBoard(game.board, game.maxY, game.canvas);
    })
}