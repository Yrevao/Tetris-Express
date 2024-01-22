const utils = require('../utils');
const views = require ('../views');
const s_match = require('../schemas/s_match');
const s_player = require('../schemas/s_player');

const s_player_update_data = ['board', 'bagCount'];

const generateSevenBag = (): number[] => {
    // shuffle pieces into bag
    let pieces: number[] = [0, 1, 2, 3, 4, 5, 6];
    let bag: number[] = [];

    while(bag.length < 7) {
        const pos: number = Math.floor(Math.random() * pieces.length);

        bag.push(pieces[pos]);
        pieces.splice(pos, 1);
    }

    return bag;
}

const resetMatch = (matchId) => {
    // reset match schema
    let match = s_match.findByKey(matchId);

    match.bags = [];
    match.started = false;

    s_match.findByKeyAndOverwrite(matchId, match);

    // reset player schemas
    s_player.findManyByPropertyAndUpdate('match', matchId, 'board', []);
    s_player.findManyByPropertyAndUpdate('match', matchId, 'lost', false);
    s_player.findManyByPropertyAndUpdate('match', matchId, 'bagCount', 0);
}

module.exports.init = (req, res) => {
    const locals = { title: 'Tetris Express', bundle: 'bundle_tetrisClient.js' };

    res.send(views.bootstrap(locals));
}

module.exports.join = (req, res) => {
    let host = false;
    if(Object.keys(s_match.findManyByProperty('match', req.query.match)).length == 0)
        host = true;

    s_player.insert(req.body.player, req.query.match, req.body.username, host);

    let match = s_match.findByKey(req.query.match);
    if(match == null)
        s_match.insert(req.query.match);

    res.json({isHost: host});
}

module.exports.nextBag = (req, res) => {
    // player data and check if player exists
    const player = s_player.findByKey(req.body.player);
    if(!player)
        return;

    // bag number the player needs
    const currentBag: number = player.bagCount + 1;
    // all the bags that have been generated for the match
    let currentBags = s_match.findByKey(player.match).bags;

    // player is on the bag they need
    s_player.findByKeyAndUpdate(req.body.player, 'bagCount', currentBag);

    let bag: number[] = [];
    if(!currentBags)
        currentBags = [];
    
    // the needed bag has not been generated
    if(currentBag > currentBags.length) {
        // use all 7 pieces every 7 plays if seven bag is enabled
        if(s_match.findByKey(player.match).sevenBag)
            bag = generateSevenBag();
        // otherwise random pieces every play
        else {
            while(bag.length < 7)
                bag.push(Math.floor(Math.random() * 7));
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
}

module.exports.updateState = (req, res, io) => {
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

    // check if all the players have lost
    let players = s_player.findManyByProperty('match', matchId);
    
    let allLost = true;
    for(let id in players) {
        if(!players[id].lost) {
            allLost = false;
            break;
        }
    }
    if(allLost) {
        resetMatch(matchId);
        io.to(matchId).emit('reset');
    }

    res.json({status: 'ok'});
}

module.exports.startMatch = (req, res, io) => {
    let player = s_player.findByKey(req.body.player);
    if(!player.host) {
        res.json({status: 'ok'});
        return;
    }

    resetMatch(player.match);

    // set match settings
    let match = s_match.findByKey(player.match);
    console.log(match);
    match.sevenBag = req.body.settings.global.sevenBag;
    match.started = true;

    s_match.findByKeyAndOverwrite(player.match, match);

    io.to(player.match).emit('start', req.body.settings);
    res.json({status: 'ok'});
}

module.exports.pauseMatch = (req, res, io) => {
    let player = s_player.findByKey(req.body.player);
    if(!player.host || !s_match.findByKey(player.match).started) {
        res.json({status: 'ok'});
        return;
    }

    // toggle paused state of match
    let match = s_match.findByKey(player.match);
    match.paused = !match.paused;
    s_match.findByKeyAndOverwrite(player.match, match);

    io.to(player.match).emit('pause', { paused: match.paused });
    res.json({status: 'ok'});

}

module.exports.joinSocket = (socket, io) => {
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
}

module.exports.leave = (socket, io) => {
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

    // indicate to other players in match that a player has left
    io.to(matchId).emit('update', {flag: 'leave', player: socket.id});

    // if the host leaves assign another player to host
    if(player.host) {
        let newHost = s_player.findManyKeysByProperty('match', matchId)[0];
        s_player.findByKeyAndUpdate(newHost, 'host', true);

        io.to(newHost).emit('update', {flag: 'giveHost'});
    }
}