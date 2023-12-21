const views = require ('../views');

module.exports = {
    init: (req, res) => {
        const locals = { title: 'Tetris Website Placeholder Title', bundle: 'bundle_tetrisClient.js' };

        res.send(views.bootstrap(locals));
    },
    nextBag: (req, res) => {
        // shuffle pieces into bag
        let pieces = [0, 1, 2, 3, 4, 5, 6];
        let bag = [];

        while(bag.length < 7) {
            const pos = Math.floor(Math.random() * pieces.length);

            bag.push(pieces[pos]);
            pieces.splice(pos, 1);
        }

        res.json({bag: bag});
    }
}