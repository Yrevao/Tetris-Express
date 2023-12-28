const gameUtils = require('./gameUtils.js');
let lobby = null;
let game = null;
let input = null;

// begin loop with initialized game and input objects
export const beginLoop = (ticksPerSecond, initlobby, initgame, initInput) => {
    lobby = initlobby;
    game = initgame;
    input = initInput;

    updateLoop(ticksPerSecond);
}

// update loop at set update per second
const updateLoop = (ticksPerSecond) => {
    setTimeout(() => {
        input.checkKeys();
        game.tick();

        const views = game.getViews().concat(lobby.getViews());
        gameUtils.updateViews(views);

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}