const gameUtils = require('./gameUtils.js');
let model = null;
let input = null;

// begin loop with initialized model and input objects
export const beginLoop = (ticksPerSecond, initModel, initInput) => {
    model = initModel;
    input = initInput;

    updateLoop(ticksPerSecond);
}

// update loop at set update per second
const updateLoop = (ticksPerSecond) => {
    setTimeout(() => {
        input.checkKeys();
        model.tick();
        gameUtils.updateCanvases([model.getGameView()]);

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}