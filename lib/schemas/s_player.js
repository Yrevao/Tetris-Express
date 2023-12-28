const schema = require('.');

schema.init((match) => {
    return {
        match: match,
        board: [],
        lost: false,
        bagCount: 0,
        socket: null
    }
});

module.exports = schema;