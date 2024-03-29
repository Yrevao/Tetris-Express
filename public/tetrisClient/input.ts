let keyMap: Map<string, KeyState> = new Map();  // map keys to methods
let rolloverMs: number = -1;                    // how long to hold a key before repeat inputs
let rolloverSpeed: number = -1;                 // how fast to repeat inputs

// the state of a control (key)
export type KeyState = {
    action: Function,                           // method called for each keypress or rollover keypress
    down: boolean,                              // is the key currently down
    rollover: boolean,                          // has the key started rollover keystrokes
    doRollover: boolean,                        // does the key auto keystroke after a certain time
    whenDown: number,                           // Date.now() of when the key was pressed
    lastAction: number,                         // Date.now() of the last time the action method was called
    presses: number                             // how many keypresses need to be executed
}

// keystate object
const newKeyState = (action: Function, doRollover: boolean): KeyState => {
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

// set rollover rate, how long a key has to be held for autorepeat and how fast to autorepeat
export const setRollover = (delay?: number, speed?: number) => {
    if(delay)
        rolloverMs = delay;
    if(speed)
        rolloverSpeed = speed;
}

// clear all keybinds
export const clearBinds = () => {
    keyMap.clear();
}

// set a keybind
export const bindKey = (key: string, action: Function, doRollover: boolean) => {
    keyMap.set(key, newKeyState(action, doRollover));
}

// get current keybinds and rollover settings
export const getSettings = (): any => {
    return {
        keyMap: keyMap,
        rolloverMs: rolloverMs,
        rolloverSpeed: rolloverSpeed
    };
}

// check keystroke buffer
export const checkKeys = () => {
    // check keystrokes
    keyMap.forEach((keyState, k) => {
        // get state and function for key
        const keyFunction: Function = keyState.action;

        // check if key is held long enough for rollover
        if(keyState.doRollover && keyState.down) {
            // update how long the key has been down for
            const msDown: number = Date.now() - keyState.whenDown;
            const msIdle: number = Date.now() - keyState.lastAction;

            // do something if the key has been held down long enough
            if(msDown >= rolloverMs && !keyState.rollover) {
                keyState.rollover = true;
                keyState.lastAction = Date.now();
                keyState.presses++;
            }
            else if(msIdle >= rolloverSpeed && keyState.rollover) {
                // calculate how many rollovers have happened since the last tick
                const rolloverActions: number = Math.floor(msIdle / rolloverSpeed);

                keyState.lastAction = Date.now();
                keyState.presses = rolloverActions;
            }
        }

        // activate the key however many times it was pressed in one update cycle
        for(;keyState.presses > 0; keyState.presses--) {
            keyFunction(keyState);
        }

        keyMap.set(k, keyState);
    });
}

// set the current user input
export const keyAction = (key: string, down: boolean) => {
    // make sure the key is bound to an action
    let keyState: KeyState | undefined = keyMap.get(key);
    if(!keyState)
        return;

    // only set key if it's down, mapped to something, and has not been held
    if(down && keyState.whenDown == -1) {
        keyState.down = true;
        keyState.presses++;
        keyState.whenDown = Date.now();
        keyState.lastAction = Date.now();

    }
    // on keyup set key as not down
    else if(!down) {
        keyState.down = false;
        keyState.presses++;
        keyState.rollover = false;
        keyState.whenDown = -1;
        keyState.lastAction = -1;
    }

    keyMap.set(key, keyState);
}

// keystoke capture
document.addEventListener('keydown', (event: KeyboardEvent) => {
    keyAction(event.key, true);
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
    event.preventDefault();
    keyAction(event.key, false);
});
