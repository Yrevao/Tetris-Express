const schema = require('.');

schema.init(() => {
    return {
        bags: [],
        sevenBag: true,
        started: false,
        paused: false
    }
});

module.exports = schema;