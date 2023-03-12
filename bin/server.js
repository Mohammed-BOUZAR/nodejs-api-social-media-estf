// const app = require('../index')(io);
// const httpServer = require('http').createServer(app);
// const io = require('socket.io')(httpServer, {
//   cors: {
//     origin: '*',
//   }
// });

// const jwt = require('jsonwebtoken');
// const { User } = require('../models/user'); // assuming your models are in the models directory
// const { Conversation } = require('../models/conversation'); // assuming your models are in the models directory

// // function to verify if a JSON Web Token is valid
// const verifyToken = async (token) => {
//   // console.log(token)
//   return jwt.verify(token, process.env.JWT_SECRET_KEY);
// };

// io.of('/chat').use(async (socket, next) => {
//   try {
//     const cookies = socket.handshake.headers.cookie;
//     let token = cookies.split('=')[1];
//     verifyToken(token)
//       .then(res => {
//         socket.me = res.userId;
//         return next();
//       }).catch(err => { console.log(err) });

//   } catch (err) {
//     console.error(err);
//     return next(new Error('Unauthorized'));
//   }
// }).on('connection', socket => {
//   socket.on('join', async ({ room }) => {
//     console.log(`Room ${room} created me: ${socket.me}.`);
//     socket.join(`${room}`);
//     console.log(io.of('/chat').adapter.rooms);
//   });

//   // socket.on('join', ({ room, userId }) => {
//   //   socket.join(room);
//   //   console.log('joined: ', room)
//   // })

//   socket.on('send', ({ room, message }) => {
//     console.log(`message : ${message} me: ${socket.me} room: ${room}`);
//     socket.to(room).emit('receive', message);
//   });
// });


// // io.use(async (socket, next) => {
// //   try {
// //     const token = socket.handshake.query.token;
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // replace <SECRET_KEY> with your own secret key
// //     const userId = decoded.userId;
// //     const user = await User.findById(userId);
// //     console.log(user);

// //     if (!user) {
// //       return next(new Error('User not found'));
// //     }

// //     socket.user = user;
// //     next();
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // io.on('connection', (socket) => {
// //   console.log('Socket.io connected');

// //   // join a conversation room
// //   socket.on('join conversation', async (conversationId) => {
// //     try {
// //       const user = socket.user;
// //       const conversation = await Conversation.findById(conversationId);

// //       if (!conversation) {
// //         throw new Error('Conversation not found');
// //       }

// //       if (!conversation.participant.includes(user._id)) {
// //         throw new Error('User not a participant in conversation');
// //       }

// //       socket.join(conversationId);
// //       console.log(`User ${user._id} joined conversation ${conversation._id}`);
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   });

// //   // leave a conversation room
// //   socket.on('leave conversation', async (conversationId) => {
// //     try {
// //       const user = socket.user;
// //       const conversation = await Conversation.findById(conversationId);

// //       if (!conversation) {
// //         throw new Error('Conversation not found');
// //       }

// //       socket.leave(conversationId);
// //       console.log(`User ${user._id} left conversation ${conversation._id}`);
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   });

// //   // send a message to a conversation
// //   socket.on('send message', async ({ conversationId, message }) => {
// //     try {
// //       const user = socket.user;
// //       const conversation = await Conversation.findById(conversationId);

// //       if (!conversation) {
// //         throw new Error('Conversation not found');
// //       }

// //       if (!conversation.participant.includes(user._id)) {
// //         throw new Error('User not a participant in conversation');
// //       }

// //       conversation.messages.push({
// //         sender: user._id,
// //         content: message,
// //         date: Date.now(),
// //         unread: conversation.participant.filter(participantId => participantId !== user._id)
// //       });

// //       await conversation.save();
// //       console.log(`User ${user._id} sent a message to conversation ${conversation._id}`);
// //       io.of(`/conversation/${conversationId}`).emit('new message', conversation.messages.slice(-1)[0]);
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('Socket.io disconnected');
// //   });
// // });

// httpServer.listen(process.env.PORT, () => {
//   console.log(`Socket.io server listening on port ${process.env.PORT}`);
// });































// // const express = require('express');
// // const app = express();
// // const server = require('http').createServer(app);
// // const io = require('socket.io')(server);
// // const { User } = require('../models/user');
// // const { Conversation } = require('../models/conversation');

// // // Set up Socket.io connection
// // io.of(/^\/messages-notifications\/\w+$/).use(async (socket, next) => {
// //   try {
// //     const conversationId = socket.nsp.name.split('/').pop();

// //     const user = await User.findOne({ _id: userId }).populate({
// //       path: 'conversations',
// //       match: { _id: conversationId },
// //       populate: { path: 'participants' }
// //     });

// //     if (!user) throw new Error('User not found');

// //     socket.user = user;
// //     socket.conversation = user.conversations[0];

// //     return next();
// //   } catch (err) {
// //     console.error(err);
// //     return next(new Error('Unauthorized'));
// //   }
// // }).on('connection', socket => {
// //   console.log(`User ${socket.user.name} connected to conversation ${socket.conversation._id}`);

// //   socket.join(socket.conversation._id);

// //   socket.on('disconnect', () => {
// //     console.log(`User ${socket.user.name} disconnected from conversation ${socket.conversation._id}`);
// //     socket.leave(socket.conversation._id);
// //   });

// //   socket.on('send-message', async message => {
// //     try {
// //       const newMessage = {
// //         sender: socket.user._id,
// //         content: message,
// //         date: new Date(),
// //         unread: socket.conversation.participants.filter(participant => participant._id !== socket.user._id).map(participant => participant._id)
// //       };

// //       socket.conversation.messages.push(newMessage);
// //       await socket.conversation.save();

// //       // Notify all participants of new message
// //       io.of(`/messages-notifications/${socket.conversation._id}`).to(socket.conversation._id).emit('new-message', newMessage);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   });
// // });

// // // Start server
// // server.listen(3000, () => {
// //   console.log('Server started on port 3000');
// // });





































// // const http = require('http');
// // const express = require('express');
// // const socketio = require('socket.io');

// // const app = require('../index');
// // const server = http.createServer(app);
// // const io = socketio(server);

// // const PORT = process.env.PORT || 3000;

// // // store user and conversation data
// // const users = {};
// // const conversations = {};


// // // function to verify if a JSON Web Token is valid
// // const verifyToken = async (token) => {
// //   return jwt.verify(token, process.env.JWT_SECRET_KEY);
// // };

// // // middleware for authentication
// // io.use((socket, next) => {
// //   verifyToken(cookies.jwt)
// //     .then(user => {
// //       socket.user = user.userId;
// //       socket.roomId = roomId;
// //       next();
// //     })
// //     .catch(err => {
// //       next(err);
// //     });
// //   const { userId, conversationId } = socket.handshake.query;

// //   if (!userId || !conversationId) {
// //     return next(new Error('userId and conversationId are required'));
// //   }

// //   socket.userId = userId;
// //   socket.conversationId = conversationId;

// //   if (!users[userId]) {
// //     users[userId] = {};
// //   }

// //   if (!conversations[conversationId]) {
// //     conversations[conversationId] = {};
// //   }

// //   next();
// // });


// // io.on('connection', (socket) => {
// //   console.log(`Socket connected: ${socket.id}`);

// //   // join conversation room
// //   socket.join(socket.conversationId);

// //   // add user to conversation
// //   conversations[socket.conversationId][socket.userId] = socket.id;

// //   // send message
// //   socket.on('sendMessage', (data) => {
// //     const { message } = data;

// //     // send message to all users in conversation except sender
// //     socket.to(socket.conversationId).broadcast.emit('newMessage', {
// //       message,
// //       sender: socket.userId
// //     });
// //   });

// //   // disconnect
// //   socket.on('disconnect', () => {
// //     console.log(`Socket disconnected: ${socket.id}`);

// //     // remove user from conversation
// //     delete conversations[socket.conversationId][socket.userId];

// //     if (Object.keys(conversations[socket.conversationId]).length === 0) {
// //       delete conversations[socket.conversationId];
// //     }
// //   });
// // });

// // server.listen(PORT, () => {
// //   console.log(`Server listening on port ${PORT}`);
// // });











































// // const express = require('express');
// // const http = require('http');
// // const socketIO = require('socket.io');
// // const jwt = require('jsonwebtoken');
// // const cookie = require('cookie');

// // const app = require('../index');
// // const server = http.createServer(app);
// // const io = socketIO(server);

// // // middleware to authenticate the socket connection
// // io.of(/^\/messages-notifications\/\w+$/).use((socket, next) => {
// //   const roomId = socket.nsp.name.split('/')[2];
// //   const cookies = cookie.parse(socket.handshake.headers.cookie || '');
// //   verifyToken(cookies.jwt)
// //     .then(user => {
// //       socket.user = user;
// //       socket.roomId = roomId;
// //       next();
// //     })
// //     .catch(err => {
// //       next(err);
// //     });
// // });

// // // function to verify if a JSON Web Token is valid
// // const verifyToken = async (token) => {
// //   return jwt.verify(token, process.env.JWT_SECRET_KEY);
// // };

// // const conversations = {};

// // io.of(/^\/messages-notifications\/\w+$/).on('connection', (socket) => {
// //   console.log(`User ${socket.user.userId} connected to room ${socket.roomId}`);

// //   // join the room
// //   socket.join(socket.roomId);

// //   // add the user to the conversation if they aren't already
// //   if (!conversations[socket.roomId]) {
// //     conversations[socket.roomId] = [socket.user];
// //   } else if (!conversations[socket.roomId].find(user => user.userId === socket.user.userId)) {
// //     conversations[socket.roomId].push(socket.user);
// //   }

// //   // send the list of users in the conversation to everyone in the room
// //   io.of(`/messages-notifications/${socket.roomId}`).emit('userList', conversations[socket.roomId]);

// //   // send a message to everyone in the room that the user has joined
// //   socket.to(socket.roomId).emit('userJoined', socket.user);

// //   socket.on('message', (message) => {
// //     console.log(`Message received from ${socket.user.userId} in room ${socket.roomId}: ${message}`);
// //     // send the message to everyone in the room
// //     io.of(`/messages-notifications/${socket.roomId}`).emit('message', { user: socket.user, message });
// //   });

// //   socket.on('disconnect', () => {
// //     console.log(`User ${socket.user.userId} disconnected from room ${socket.roomId}`);

// //     // remove the user from the conversation
// //     if (conversations[socket.roomId]) {
// //       conversations[socket.roomId] = conversations[socket.roomId].filter(user => user.userId !== socket.user.userId);
// //       io.of(`/messages-notifications/${socket.roomId}`).emit('userList', conversations[socket.roomId]);
// //       socket.to(socket.roomId).emit('userLeft', socket.user);
// //     }
// //   });
// // });

// // server.listen(3000, () => {
// //   console.log('Server listening on port 3000');
// // });






















// // const jwt = require('jsonwebtoken');
// // const cookie = require('cookie');
// // const { Server } = require("socket.io");
// // // const mongoose = require('mongoose');
// // // const express = require('express');
// // const app = require('../index');
// // const http = require('http');
// // const server = http.createServer(app);


// // // Initialize Socket.io server
// // const io = new Server(server, {
// //   path: '/socket.io',
// // });

// // // a function to verify if a jsonwebtoken is valid
// // verifyToken = async (token) => {
// //   return jwt.verify(token, process.env.JWT_SECRET_KEY)
// // }

// // // Middleware to authenticate user with JSON Web Token
// // io.use((socket, next) => {
// //   const cookies = cookie.parse(socket.handshake.headers.cookie || '');
// //   const token = cookies.jwt;

// //   // Verify JWT
// //   verifyToken(token)
// //     .then(user => {
// //       socket.user = user;
// //       socket.id = user.userId;
// //       console.log(`userId: ${user.userId}`);
// //       next();
// //     })
// //     .catch(err => {
// //       next(err);
// //     });
// // });

// // // Socket.io event handlers
// // io.on('connection', (socket) => {
// //   console.log(`Socket.io client connected: ${socket.id}`);
// //   socket.on('message', (data) => {
// //     console.log(`Message received: ${data}`);
// //     io.emit('message', data);
// //   });
// //   socket.on('disconnect', () => {
// //     console.log(`Socket.io client disconnected: ${socket.id}`);
// //   });
// // });

// // // Start server
// // const port = process.env.PORT || 3000;
// // server.listen(port, () => {
// //   console.log(`Server listening on port ${port}`);
// // });





















// // const jwt = require('jsonwebtoken');
// // var app = require('../index');
// // var http = require('http');
// // var cookie = require('cookie');

// // /** * Get port from environment and store  it in Express. 🐱‍🏍*/

// // var port = process.env.PORT || 3000;
// // app.set('port', port);

// // /*  Create HTTP server.*/

// // // var server = http.createServer(app);

// // /*  integrate socketIo 🎉  */

// // const { Server } = require("socket.io");
// // // const io = new Server(server);

// // /*  array holds the id of connnected users */

// // let connectedUsers = [];

// // /* those are the events we will have on the client side and server side
// //   [connection] - [notification-message] - [notification-comment] - [notification-replay] - [disconnection]
// // */
// // const io = require('socket.io')(http);

// // io.on('connection', (socket) => {
// //   console.log('a user connected');
// //   socket.on('chat message', (msg) => {
// //     console.log('message: ' + msg);
// //     io.emit('chat message', msg);
// //   });
// //   socket.on('disconnect', () => {
// //     console.log('user disconnected');
// //   });
// // });


// // /*  a middleware to authenticate a user if he is trying to connect or send a message keep in minde  */
// // /* the user can send a message or raise a notification only if he has a valid JSONWEBTOKEN (JWT)*/

// // io.of("/messages-notifications").use((socket, next) => {
// //   console.log('hhhh');
// //   var cookies = cookie.parse(socket.handshake.headers.cookie || '');
// //   verifyToken(cookies.jwt)
// //     .then(user => {
// //       socket.user = user;
// //       socket.id = user.userId;
// //       console.log('hello');
// //       next();
// //     })
// //     .catch(err => {
// //       next(err);
// //     });
// // });
// // // a function to verify if a jsonwebtoken is valid
// // verifyToken = async (token) => {
// //   return jwt.verify(token, process.env.JWT_SECRET_KEY)
// // }

// // // on each connection 
// // //1 - update the list of connected users and send it to other users
// // io.of('/messages-notifications').on('connection', (socket) => {
// //   console.log("hhhh")
// //   if (!connectedUsers.find((user) => user == socket.id)) {
// //     connectedUsers.push(socket.id);
// //     io.of('/messages-notifications').emit('connection', { ConnectedUsers: connectedUsers })
// //   }

// //   // if a user send an event "message" send it to the corresponding user then stor it in the dataBase
// //   socket.on('message', (message) => {
// //     console.log(message);
// //     io.of('/messages-notifications').to(message.reciever).to(socket.id).emit('notification-message', message);
// //     // save the message to the database

// //   })
// //   socket.on("comment", (comment) => {
// //     // if the reciever is connected: send him the comment as a notification
// //     // if he acknolodes the comment: registr the comment in the database as seen comment
// //     // else as unseen comment
// //   })
// //   socket.on('disconnect', () => {
// //     connectedUsers = connectedUsers.filter((user) => user !== socket.id);
// //     io.of('/messages-notifications').emit('disconnetion', { ConnectedUsers: connectedUsers })
// //   });



// // });

// // // *********************************************************** 🤞🤞 ********************************

// // /* Listen on provided port, on all network interfaces.*/

// // http.listen(port);


