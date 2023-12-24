let keyMap = {};                // map keys to methods
let rolloverMs = -1;            // how long to hold a key before repeat inputs
let rolloverSpeed = -1;         // how fast to repeat inputs

// keystate object
const newKeyState = (action, doRollover) => {
    return {
        action: action,
        down: false,
        rollover: false,
        doRollover: doRollover,
        whenDown: -1,
        lastAction: -1,
        presses: 0
    }
}

export const init = (delay, speed) => {
    rolloverMs = delay;
    rolloverSpeed = speed;
}

export const bindKey = (key, action, doRollover) => {
    keyMap[key] = newKeyState(action, doRollover);
}

export const getSettings = () => {
    return {
        keyMap: keyMap,
        rolloverMs: rolloverMs,
        rolloverSpeed: rolloverSpeed
    };
}

// check keystroke buffer
export const checkKeys = () => {
    // check keystrokes
    for(let k in keyMap) {
        // get state and function for key
        const keyState = keyMap[k];
        const keyFunction = keyMap[k].action;

        // check if key is held long enough for rollover
        if(keyState.doRollover && keyState.down) {
            // update how long the key has been down for
            const msDown = Date.now() - keyState.whenDown;
            const msIdle = Date.now() - keyState.lastAction;

            // do something if the key has been held down long enough
            if(msDown >= rolloverMs && !keyState.rollover) {
                keyState.rollover = true;
                keyState.lastAction = Date.now();
                keyState.presses++;
            }
            else if(msIdle >= rolloverSpeed && keyState.rollover) {
                // calculate how many rollovers have happened since the last tick
                const rolloverActions = Math.floor(msIdle / rolloverSpeed);

                keyState.lastAction = Date.now();
                keyState.presses = rolloverActions;
            }
        }

        // activate the key however many times it was pressed in one update cycle
        for(;keyState.presses > 0; keyState.presses--) {
            keyFunction(keyState);
        }

        keyMap[k] = keyState;
    }
}

// set the current user input
export const keyAction = (key, down) => {
    // make sure the key is bound to an action
    if(!Object.getOwnPropertyNames(keyMap).includes(key))
        return;

    // only set key if it's down, mapped to something, and has not been held
    if(down && keyMap[key].whenDown == -1) {
        let keyState = keyMap[key];

        keyState.down = true;
        keyState.presses++;
        keyState.whenDown = Date.now();
        keyState.lastAction = Date.now();

        keyMap[key] = keyState;
    }
    // on keyup set key as not down
    else if(!down) {
        let keyState = keyMap[key];

        keyState.down = false;
        keyState.presses++;
        keyState.rollover = false;
        keyState.whenDown = -1;
        keyState.lastAction = -1;

        keyMap[key] = keyState;
    }
}

// keystoke capture
document.addEventListener('keydown', (event) => {
    keyAction(event.key, true);
});

document.addEventListener('keyup', (event) => {
    keyAction(event.key, false);
});
