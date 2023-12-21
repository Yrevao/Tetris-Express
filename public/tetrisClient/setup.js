const draw = require('./draw.js');
const model = require('./model.js');
const input = require('./input.js');
const loop = require('./loop.js');

// begin match
export const start = async (session, playfieldCanvas) => {
    await model.init(session, playfieldCanvas);

    input.initRollover(167, 33);
    setBinds();

    loop.beginLoop(60, model, input);
}

// set keybindings
const setBinds = () => {
    input.bindKey('ArrowLeft', model.controlMethods.left, true);
    input.bindKey('ArrowRight', model.controlMethods.right, true);
    input.bindKey('z', model.controlMethods.rotLeft, false);
    input.bindKey('ArrowUp', model.controlMethods.rotRight, false);
    input.bindKey('a', model.controlMethods.rot180, false);
    input.bindKey('ArrowDown', model.controlMethods.softDrop, false);
    input.bindKey(' ', model.controlMethods.hardDrop, false);
    input.bindKey('c', model.controlMethods.hold, false);
}