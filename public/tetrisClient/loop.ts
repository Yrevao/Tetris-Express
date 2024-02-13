let tickrate: number | null = null
let loop: boolean = false;
let tickMethod: Function | null = null;

// update loop at set update per second
const updateLoop = (ticksPerSecond: number) => {
    setTimeout(() => {
        if(!loop || !tickMethod)
            return;

        tickMethod();

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}

// begin loop using given tick method
export const start = (ticksPerSecond: number, initTickMethod: Function) => {
    loop = true;
    tickMethod = initTickMethod;
    tickrate = ticksPerSecond;
    updateLoop(ticksPerSecond);
}

export const restart = () => {
    if(!tickrate)
        return;

    loop = true;
    updateLoop(tickrate);
}

export const stop = () => {
    loop = false;
}