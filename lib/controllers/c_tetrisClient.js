const render = require ('../render');

module.exports = {
    init: (req, res) => {
        const params = { title: 'Tetris Website Placeholder Title', bundle: 'bundle_tetrisClient.js' };

        res.send(render.bootstrap(params));
    }
}