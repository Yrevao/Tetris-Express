const schema = require('.');

export const player = schema.init((match) => {
    return {
        matchId: match,
        board: [],
        bagCount: 0
    }
})