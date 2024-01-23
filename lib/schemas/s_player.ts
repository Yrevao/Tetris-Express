import { Schema } from './';
import { Socket } from 'socket.io';
export { Player, newPlayer, s_player };

type Player = {
    username: string;
    match: string;
    host: boolean;
    board: any[][];
    lost: boolean;
    bagCount: number;
    socket: Socket | null;
}

// create a new player object with default and argument values assigned
const newPlayer = (match, username, host): Player => {
    return {
        username: username,
        match: match,
        host: host,
        board: [],
        lost: false,
        bagCount: 0,
        socket: null
    }
}

const s_player = new Schema<Player>();