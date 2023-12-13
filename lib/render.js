const pug = require('pug');
const viewDir = './lib/views/';

module.exports = {
    bootstrap: pug.compileFile(viewDir + 'bootstrap.pug')
}