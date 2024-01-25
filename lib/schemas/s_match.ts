import { Schema } from './';
export { Match, newMatch, s_match };

type Match = {
    bags: number[][],
    sevenBag: boolean,
    started: boolean,
    paused: boolean
}

// create a new match object with default values assigned
const newMatch = (): Match => {
    return {
        bags: [],
        sevenBag: true,
        started: false,
        paused: false
    }
}

let s_match = new Schema<Match>(newMatch);