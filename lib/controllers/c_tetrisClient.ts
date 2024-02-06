import express from 'express';
import socketIO from 'socket.io';
const views = require ('../views');
import { Match, newMatch, s_match } from '../schemas/s_match';
import { Player, newPlayer, s_player } from '../schemas/s_player';


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

const resetMatch = (matchId: string) => {
    // reset match schema
    let match: Match = s_match.findByKey(matchId);

    match.bags = [];
    match.paused = false;
    match.started = false;

    s_match.findByKeyAndOverwrite(matchId, match);

    // reset player schemas
    s_player.findManyByPropertyAndUpdate('match', matchId, 'board', []);
    s_player.findManyByPropertyAndUpdate('match', matchId, 'lost', false);
    s_player.findManyByPropertyAndUpdate('match', matchId, 'bagCount', 0);
}

// update with match flag, return if all players have lost
const matchUpdate = (player: Player, matchId: string, board: any[][], lost: boolean): boolean => {
    // update the match data in the player's schema
    player.board = board;
    player.lost = lost;

    // check if all the players have lost
    let players: Map<string, Player> = s_player.findManyByProperty('match', matchId);
    
    let allLost: boolean = true;
    for(let item of players) {
        let player: Player = item[1];

        if(!player.lost) {
            allLost = false;
            break;
        }
    }
    if(allLost)
        return true;

    return false
}

module.exports.init = (req: express.Request, res: express.Response) => {
    const locals = { title: 'Tetris Express', bundle: 'bundle_tetrisClient.js' };

    res.send(views.bootstrap(locals));
}

module.exports.join = (req: express.Request, res: express.Response) => {
    // check that req object has the correct values
    let playerId: string | undefined = req.body.player;
    let matchId: string | undefined = req.body.match;
    let username: string | undefined = req.body.username;
    if(!playerId || !matchId || !username) {
        res.json({isHost: false});
        return;
    }

    // check if the player is host by checking if they are the only player in the match
    let playerCount: number = s_player.findManyByProperty('match', matchId).size;
    let host: boolean = playerCount == 0;

    // add player and match if the match doesen't exist
    s_player.insert(playerId, matchId, username, host);
    let match: string | undefined = s_match.findByKey(matchId);
    if(!match)
        s_match.insert(matchId);

    res.json({isHost: host});
}

module.exports.nextBag = (req: express.Request, res: express.Response) => {
    // player data and check if player exists
    const playerId: string | undefined = req.body.player;
    if(!playerId) {
        res.json({bag: []});
        return;
    }
    const player: Player = s_player.findByKey(req.body.player);

    // bag number the player needs
    const currentBag: number = player.bagCount + 1;
    // all the bags that have been generated for the match
    let currentBags = s_match.findByKey(player.match).bags;

    // player is on the bag they need
    s_player.findByKeyAndUpdate(playerId, 'bagCount', currentBag);

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

module.exports.updateState = (req: express.Request, res: express.Response, io: socketIO.Server) => {
    const playerId: string | undefined = req.body.player;
    const flag: string | undefined = req.body.flag;
    if(!flag || !playerId) {
        res.json({status: 'ok'});
        return;
    }

    const player: Player = s_player.findByKey(playerId);
    const matchId: string = player.match;

    switch(flag) {
        case 'match':
            // null check
            if(!req.body.board || req.body.lost == undefined) {
                res.json({status: 'ok'});
                return;
            }
            // update schemas and check if game is over
            else if(matchUpdate(player, matchId, req.body.board, req.body.lost)) {
                resetMatch(matchId);
                io.to(matchId).emit('reset');
            }
            break;
        case 'username':
            if(!req.body.username) {
                res.json({status: 'ok'});
                return;
            }

            // update username
            player.username = req.body.username;
            break;
    }

    s_player.findByKeyAndOverwrite(playerId, player);

    io.to(matchId).emit('update', {flag: 'update', player: playerId, board: player.board, username: player.username, lost: req.body.lost});

    res.json({status: 'ok'});
}

module.exports.startMatch = (req: express.Request, res: express.Response, io: socketIO.Server) => {
    let player: Player | undefined = s_player.findByKey(req.body.player);
    let setting_sevenBag: boolean | undefined = req.body.settings.global.sevenBag;
    let settings: any = req.body.settings;
    if(!player || !setting_sevenBag || !settings || !player.host) {
        res.json({status: 'ok'});
        return;
    }

    resetMatch(player.match);

    // set match settings
    let match: Match = s_match.findByKey(player.match);

    match.sevenBag = setting_sevenBag;
    match.started = true;

    s_match.findByKeyAndOverwrite(player.match, match);

    io.to(player.match).emit('start', settings);
    res.json({status: 'ok'});
}

module.exports.pauseMatch = (req: express.Request, res: express.Response, io: socketIO.Server) => {
    let player: Player | undefined = s_player.findByKey(req.body.player);
    if(!player || !player.host || !s_match.findByKey(player.match).started) {
        res.json({status: 'ok'});
        return;
    }

    // toggle paused state of match
    let match: Match = s_match.findByKey(player.match);
    match.paused = !match.paused;
    s_match.findByKeyAndOverwrite(player.match, match);

    io.to(player.match).emit('pause', { paused: match.paused });
    res.json({status: 'ok'});
}

module.exports.joinSocket = (socket: socketIO.Socket, io: socketIO.Server) => {
    const player: Player = s_player.findByKey(socket.id);
    if(!player)
        return;
    const matchId: string = player.match;

    // once the player is connected add their socket to the player schema
    s_player.findByKeyAndUpdate(socket.id, 'socket', socket);
    socket.join(matchId);

    const playerData: Map<string, Player> = s_player.findManyByProperty('match', matchId);
    const players: any = {};
    for(let item of playerData) {
        let aPlayer = {
            board: item[1].board,
            username: item[1].username
        }
        players[item[0]] = aPlayer;
    }

    io.to(socket.id).emit('update', {flag: 'init', players: structuredClone(players)});
    io.to(matchId).emit('update', {flag: 'join', player: socket.id, username: player.username});
}

module.exports.leave = (socket: socketIO.Socket, io: socketIO.Server) => {
    const player: Player = s_player.findByKey(socket.id);
    if(!player)
        return;
    const matchId: string = player.match;
    
    // when a player leaves delete them from the player schema
    s_player.findByKeyAndDelete(socket.id);
    socket.leave(matchId)

    // delete the match if there's no players in it
    const playerCount: number = s_player.findManyByProperty('match', matchId).size;
    if(playerCount == 0)
        s_match.findByKeyAndDelete(matchId);

    // indicate to other players in match that a player has left
    io.to(matchId).emit('update', {flag: 'leave', player: socket.id});

    // if the host leaves assign another player to host
    if(player.host) {
        let newHost: string = s_player.findManyKeysByProperty('match', matchId)[0];
        s_player.findByKeyAndUpdate(newHost, 'host', true);

        io.to(newHost).emit('update', {flag: 'giveHost'});
    }
}
