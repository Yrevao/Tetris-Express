const schema = require('.');

schema.init(() => {
    return {
        bags: [],
        sevenBag: true,
        started: false
    }
});

module.exports = schema;