const utils = require('../utils');
const views = require ('../views');
const s_match = require('../schemas/s_match');
const s_player = require('../schemas/s_player');

const s_player_update_data = ['board', 'bagCount'];

module.exports = {
    init: (req, res) => {
        const locals = { title: 'Tetris Website Placeholder Title', bundle: 'bundle_tetrisClient.js' };

        res.send(views.bootstrap(locals));
    },
    join: (req, res) => {
        let host = false;
        if(Object.keys(s_match.findManyByProperty('match', req.query.match)).length == 0)
            host = true;

        s_player.insert(req.body.player, req.query.match, req.body.username, host);

        let match = s_match.findByKey(req.query.match);
        if(match == null)
            s_match.insert(req.query.match);

        res.json({isHost: host});
    },
    nextBag: (req, res) => {
        // player data and check if player exists
        const player = s_player.findByKey(req.body.player);
        if(!player)
            return;

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
        const playerId = req.body.player;
        const player = s_player.findByKey(playerId);
        if(!player)
            return;
        const matchId = player.match;

        switch(req.body.flag) {
            case 'match':
                // update the match data in the player's schema
                player.board = req.body.board;
                player.lost = req.body.lost;
                break;
            case 'username':
                // update username
                player.username = req.body.username;
                break;
        }

        s_player.findByKeyAndOverwrite(playerId, player);

        io.to(matchId).emit('update', {flag: 'update', player: playerId, board: player.board, username: player.username, lost: req.body.lost});

        res.json({status: 'ok'});
    },
    startMatch: (req, res, io) => {
        if(!s_player.findByKey(req.body.player).host || s_match.findByKey(req.body.match).started) {
            res.json({status: 'ok'});
            return;
        }

        s_match.findByKeyAndUpdate(req.body.match, 'started', true);

        io.to(req.body.match).emit('start');
        res.json({status: 'ok'});
    },
    joinSocket: (socket, io) => {
        const player = s_player.findByKey(socket.id);
        if(!player)
            return;
        const matchId = player.match;

        // once the player is connected add their socket to the player schema
        s_player.findByKeyAndUpdate(socket.id, 'socket', socket);
        socket.join(matchId);

        const playerData = s_player.findManyByProperty('match', matchId);
        const players = utils.reprop(playerData, ['board', 'username']);

        io.to(socket.id).emit('update', {flag: 'init', players: players});
        io.to(matchId).emit('update', {flag: 'join', player: socket.id, username: player.username});
    },
    leave: (socket, io) => {
        const player = s_player.findByKey(socket.id);
        if(!player)
            return;
        const matchId = player.match;
        
        // when a player leaves delete them from the player schema
        s_player.findByKeyAndDelete(socket.id);
        socket.leave(matchId)

        // delete the match if there's no players in it
        const playerCount = Object.keys(s_player.findManyByProperty('match', matchId)).length;
        if(playerCount == 0)
            s_match.findByKeyAndDelete(matchId);
        else if(playerCount == 1) {
            s_player.findManyByPropertyAndUpdate('match', matchId, 'host', true);
            io.to(matchId).emit('update', {flag: 'giveHost'});
        }

        io.to(matchId).emit('update', {flag: 'leave', player: socket.id});
    }
}