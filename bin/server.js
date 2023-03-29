const jwt = require('jsonwebtoken');
const app = require('../index');
const http = require('http');
const cookie = require('cookie');

const port = process.env.PORT;

/*  Create HTTP server.*/

const server = http.createServer(app);

/*  integrate socketIo 🎉  */

const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const io = new Server(server);

/*  array holds the id of connnected users */

let connectedUsers = [];

/* those are the events we will have on the client side and server side
  [connection] - [notification-message] - [notification-comment] - [notification-replay] - [notification-reaction] - [notification-new-post] - [disconnection]
*/


// a function to verify if a jsonwebtoken is valid
const verifyToken = async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
}


/*  a middleware to authenticate a user if he is trying to connect or send a message keep in minde  */
/* the user can send a message or raise a notification only if he has a valid JSONWEBTOKEN (JWT)*/

io.of("/socket").use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || {});
    console.log(cookies);
    // let token = cookies.split('=')[1];
    verifyToken(cookies.jwt)
        .then(user => {
            // socket.user = user;
            socket.id = user.userId;
            console.log(socket.id);
            next();
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
});

// on each connection 
//1 - update the list of connected users and send it to other users
io.of('/socket').on('connection', (socket) => {
    // if (!connectedUsers.find((user) => user == socket.id)) {
    //     connectedUsers.push(socket.id);
    //     io.of('/socket-io').emit('connection', { ConnectedUsers: connectedUsers })
    // }

    connectedUsers = io.of('/socket-io').adapter.rooms;
    io.of('/socket-io').emit('connection', { ConnectedUsers: connectedUsers });
    console.log(connectedUsers);


    // if a user send an event "message" send it to the corresponding user then stor it in the dataBase
    socket.on('message', (message) => {
        console.log(message);
        io.of('/socket-io').to(message.reciever).to(socket.id).emit('notification-message', message);
        // save the message to the database

    });

    socket.on("comment", (comment) => {
        // if the reciever is connected: send him the comment as a notification
        // if he acknolodes the comment: registr the comment in the database as seen comment
        // else as unseen comment
        io.of('/socket-io').to(socket.id).emit('notification-comment', comment);
    });


    socket.on("replay", (replay) => {
        io.of('/socket-io').to(socket.id).emit('notification-replay', replay);
    });

    socket.on("reaction-post", (reaction) => {
        io.of('/socket-io').to(socket.id).emit('notification-reaction-post', reaction);
    });

    socket.on("reaction-comment", (reaction) => {
        io.of('/socket-io').to(socket.id).emit('notification-reaction-comment', reaction);
    });

    socket.on("reaction-replay", (reaction) => {
        io.of('/socket-io').to(socket.id).emit('notification-reaction-replay', reaction);
    });

    socket.on('disconnect', () => {
        connectedUsers = io.of('/socket-io').emit('connection', { ConnectedUsers: connectedUsers });
        io.of('/socket-io').emit('disconnetion', { ConnectedUsers: connectedUsers })
    });



});

// *********************************************************** 🤞🤞 ********************************

/* Listen on provided port, on all network interfaces.*/

server.listen(port, () => {
    console.log(`Socket.io server listening on port ${process.env.PORT}`);
});
