import express from 'express';
import socketIO from 'socket.io';
const controllers = require('./controllers');

module.exports = (app: express.Application, io: socketIO.Server) => {
    // webpacked javascripts
    app.use(express.static('dist/webpack'));

    // rendered tetris client html
    app.get('/', controllers.tetrisClient.init);
    app.get('/join', controllers.tetrisClient.init);

    // tetris gameplay synchronization
    app.post('/join', controllers.tetrisClient.join);
    app.post('/bag', controllers.tetrisClient.nextBag);
    app.post('/update', (req: express.Request, res: express.Response) => {
        controllers.tetrisClient.updateState(req, res, io);
    });
    app.post('/start', (req: express.Request, res: express.Response) => {
        controllers.tetrisClient.startMatch(req, res, io);
    });
    app.post('/pause', (req: express.Request, res: express.Response) => {
        controllers.tetrisClient.pauseMatch(req, res, io);
    })

    // utils
    app.post('/utils', (req: express.Request, res: express.Response) => {
        switch(req.body.method) {
            case 'username':
                controllers.utils.generateUsername(req, res);
        }
    })

    // SocketIO routes
    io.on('connection', (socket: socketIO.Socket) => {
        socket.on('joinSocket', () => {
            controllers.tetrisClient.joinSocket(socket, io);
        });

        socket.on('disconnect', () => {
            controllers.tetrisClient.leave(socket, io);
        });
    })
}