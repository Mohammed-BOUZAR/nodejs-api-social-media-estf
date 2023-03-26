
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECT)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.log("MongoDB connection error: ", err));

const app = express();


const jwt = require('jsonwebtoken');

const auth = require('./routes/auth');
const users = require('./routes/users');
const posts = require('./routes/posts');
const conversations = require('./routes/conversations');
const { isToken } = require('./middleware/token');

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));


// function to verify if a JSON Web Token is valid
const verifyToken = async (token) => {
  // console.log(token)
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

// io.of('/chat').use(async (socket, next) => {
//   try {
//     const cookies = socket.handshake.headers.cookie;
//     let token = cookies.split('=')[1];
//     verifyToken(token)
//       .then(res => {
//         socket.id = res.userId;
//         return next();
//       }).catch(err => { console.log(err) });

//   } catch (err) {
//     console.error(err);
//     return next(new Error('Unauthorized'));
//   }
// })
//   .on('connection', socket => {

//     console.log("rooms: ");
//     console.log(io.of('/chat').adapter.rooms);

//     socket.on('join', async (room) => {
//       socket.join(`${room}`);
//     });

//     socket.on('send-message', ({ room, message }) => {
//       socket.to(room).emit('receive-message', message);
//     });

//     socket.on('send-notification', ({ room, message }) => {
//       socket.to(room).emit('receive-notification', message);
//     });
//   });

app.use("/api/auth", auth);
app.use("/api/users", isToken, users);
app.use("/api/posts", isToken, posts);
app.use("/api/conversations", isToken, (req, res, next) => {
  req.io = io;
  next();
}, conversations);

app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found!" });
});

module.exports = app;