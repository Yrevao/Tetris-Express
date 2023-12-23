const schema = require('.');

schema.init(() => {
    return {
        bags: []
    }
});

module.exports = schema;