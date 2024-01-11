# Tetris Express
  Tetris Express is a multiplayer Tetris client that uses Node.js for the JavaScript runtime environment and Express for routing.
  This project is hosted here: https://tetris-express.onrender.com/

## Structure
  This project follows MVC design principles for the server-side and uses a REST-like API system to allow the client to communicate with the server.
  The server maintains the state for the different matches in progress and of each player's game; this makes the API that the client uses to communicate with the server only somewhat RESTful since the requests do rely on the state of the server.

## Function
  The server uses an Express based router to determine where the client is on the website and respond with the correct information.
  In response to requests the server can respond to the client via the Express response object and broadcast a SocketIO event to multiple other clients in order to keep all the players in a match updated on the state of the match.
