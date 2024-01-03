const schema = require('.');

schema.init((match, username, host) => {
    return {
        username: username,
        match: match,
        host: host,
        board: [],
        lost: false,
        bagCount: 0,
        socket: null
    }
});

module.exports = schema;