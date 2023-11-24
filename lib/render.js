const sy = require('sprightly');
const fs = require('fs');
const viewDir = './lib/views/';

// pre-load files
const tetris_bundle = fs.readFileSync('./dist/bundle_tetrisClient.js', {encoding: 'utf-8'});

// exported render functions
module.exports.tetrisClient = () => {
    return sy.sprightly(`${viewDir}bootstrap.html`, { jsModule: tetris_bundle });
}