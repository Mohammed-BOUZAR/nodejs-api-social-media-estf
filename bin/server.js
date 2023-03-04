const jwt = require('jsonwebtoken');
var app = require('../index');
var http = require('http');
var cookie = require('cookie');
const mongoose = require('mongoose');

require('dotenv').config({ path: '../.env' });

mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECT)
  .then(() => console.log("mongodb connected!"))
  .catch(err => console.log("mongodb not connected!"))

/** * Get port from environment and store  it in Express. 🐱‍🏍*/

var port = process.env.PORT || 3000;
app.set('port', port);

/*  Create HTTP server.*/

var server = http.createServer(app);

/*  integrate socketIo 🎉  */

const { Server } = require("socket.io");
const io = new Server(server);

/*  array holds the id of connnected users */

let connectedUsers = [];

/* those are the events we will have on the client side and server side
  [connection] - [notification-message] - [notification-comment] - [notification-replay] - [disconnection]
*/


/*  a middleware to authenticate a user if he is trying to connect or send a message keep in minde  */
/* the user can send a message or raise a notification only if he has a valid JSONWEBTOKEN (JWT)*/

io.of("/messages-notifications").use((socket, next) => {
  var cookies = cookie.parse(socket.handshake.headers.cookie || '');
  verifyToken(cookies.jwt)
    .then(user => {
      socket.user = user;
      socket.id = user.userid;
      next();
    })
    .catch(err => {
      next(err);
    });
});

// on each connection 
//1 - update the list of connected users and send it to other users
io.of('/messages-notifications').on('connection', (socket) => {
  if (!connectedUsers.find((user) => user == socket.id)) {
    connectedUsers.push(socket.id);
    io.of('/messages-notifications').emit('connection', { ConnectedUsers: connectedUsers })
  }

  // if a user send an event "message" send it to the corresponding user then stor it in the dataBase
  socket.on('message', (message) => {
    console.log(message);
    io.of('/messages-notifications').to(message.reciever).to(socket.id).emit('notification-message', message);
    // save the message to the database

  })
  socket.on("comment", (comment) => {
    // if the reciever is connected: send him the comment as a notification
    // if he acknolodes the comment: registr the comment in the database as seen comment
    // else as unseen comment
  })
  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter((user) => user !== socket.id);
    io.of('/messages-notifications').emit('disconnetion', { ConnectedUsers: connectedUsers })
  });



});

// *********************************************************** 🤞🤞 ********************************

/* Listen on provided port, on all network interfaces.*/

server.listen(port);

// a function to verify if a jsonwebtoken is valid
verifyToken = async (token) => {
  return jwt.verify(token, process.env.jwtSecret)
}
