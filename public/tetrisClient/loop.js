const gameUtils = require('./gameUtils.js');
let lobby = null;
let game = null;
let input = null;
let session = null;
let loop = false;

// update loop at set update per second
const updateLoop = (ticksPerSecond) => {
    setTimeout(() => {
        if(!loop)
            return;

        input.checkKeys();
        game.tick();

        const views = game.getViews().concat(lobby.getViews());
        gameUtils.updateViews(views);

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}

// begin loop with initialized game and input objects
export const init = (initlobby, initgame, initInput, initSession) => {
    lobby = initlobby;
    game = initgame;
    input = initInput;
    session = initSession;
}

export const events = {
    update: (data) => {
        if(data.player == session.id && data.lost)
            loop = false;
    },
    start: async (data) => {
        await game.start();
        loop = true;
        updateLoop(1000);
    }
}
