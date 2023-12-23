const views = require ('../views');
const s_match = require('../schemas/match');
const s_player = require('../schemas/player');

module.exports = {
    init: (req, res) => {
        const locals = { title: 'Tetris Website Placeholder Title', bundle: 'bundle_tetrisClient.js' };

        res.send(views.bootstrap(locals));
    },
    join: (req, res) => {
        s_player.insert(req.body.player, req.query.match);

        if(s_match.findByKey(req.query.match) == null)
            s_match.insert(req.query.match);

        res.json({status: 'ok'});
    },
    nextBag: (req, res) => {
        // player data
        const player = s_player.findByKey(req.body.player);
        // bag number the player needs
        const currentBag = player.bagCount + 1;
        // all the bags that have been generated for the match
        let currentBags = s_match.findByKey(player.match).bags;

        // player is on the bag they need
        s_player.findByKeyAndUpdate(req.body.player, 'bagCount', currentBag);

        let bag = [];
        if(!currentBags)
            currentBags = [];
        
        // the needed bag has not been generated
        if(currentBag > currentBags.length) {
            // shuffle pieces into bag
            let pieces = [0, 1, 2, 3, 4, 5, 6];

            while(bag.length < 7) {
                const pos = Math.floor(Math.random() * pieces.length);

                bag.push(pieces[pos]);
                pieces.splice(pos, 1);
            }

            // append generated bags
            currentBags.push(bag);
            s_match.findByKeyAndUpdate(player.match, 'bags', currentBags);
        }
        // the needed bag has already been generated
        else {
            bag = currentBags[currentBag - 1];
        }

        res.json({bag: bag});
    },
    updateState: (req, res, io) => {
        s_player.findByKeyAndUpdate(req.body.player, 'board', req.body.board);

        res.json({status: 'ok'});
    },
    joinSocket: (socket) => {
        s_player.findByKeyAndUpdate(socket.id, 'socket', socket);
        socket.join(s_player.findByKey(socket.id).match);
    }
}