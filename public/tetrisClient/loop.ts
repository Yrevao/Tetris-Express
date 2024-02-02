let tickrate: number | null = null
let loop: boolean = false;
let tickMethod: any = null;

// update loop at set update per second
const updateLoop = (ticksPerSecond: number) => {
    setTimeout(() => {
        if(!loop)
            return;

        tickMethod();

        updateLoop(ticksPerSecond);
    }, 1000 / ticksPerSecond);
}

// begin loop using given tick method
export const start = (ticksPerSecond: number, initTickMethod: any) => {
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