const gameUtils = require('./gameUtils.js');
let game = null;
let input = null;

// begin loop with initialized game and input objects
export const beginLoop = (ticksPerSecond, initgame, initInput) => {
    game = initgame;
    input = initInput;

    updateLoop(ticksPerSecond);
}

// update loop at set update per second
const updateLoop = (ticksPerSecond) => {
    setTimeout(() => {
        input.checkKeys();
        game.tick();
        gameUtils.updateViews(game.getViews());

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}