const gameUtils = require('./gameUtils.js');
let loop = false;
let tickMethod = null;

// update loop at set update per second
const updateLoop = (ticksPerSecond) => {
    setTimeout(() => {
        if(!loop)
            return;

        tickMethod();

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}

// begin loop using given tick method
export const start = (ticksPerSecond, initTickMethod) => {
    loop = true;
    tickMethod = initTickMethod;
    updateLoop(ticksPerSecond);
}

export const stop = () => {
    loop = false;
}