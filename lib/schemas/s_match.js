const schema = require('.');

schema.init(() => {
    return {
        bags: [],
        started: false
    }
});

module.exports = schema;