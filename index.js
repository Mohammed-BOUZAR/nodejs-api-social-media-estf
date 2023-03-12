
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.log("MongoDB connection error: ", err));

const app = express();

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
  }
});
const jwt = require('jsonwebtoken');

const posts = require('./routes/posts');
const auth = require('./routes/auth');
const users = require('./routes/users');
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

io.of('/chat').use(async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    let token = cookies.split('=')[1];
    verifyToken(token)
      .then(res => {
        socket.me = res.userId;
        return next();
      }).catch(err => { console.log(err) });

  } catch (err) {
    console.error(err);
    return next(new Error('Unauthorized'));
  }
})
  .on('connection', socket => {
    socket.on('join', async (room) => {
      console.log("room: ")
      console.log(room)
      console.log(`Room ${room} created me: ${socket.me}.`);
      socket.join(`${room}`);

      console.log(io.of('/chat').adapter.rooms);
    });

    socket.on('send', ({ room, message }) => {
      console.log(`message : ${message} me: ${socket.me} room: ${room}`);
      socket.to(room).emit('receive', message);
    });
  });

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

httpServer.listen(process.env.PORT, () => {
  console.log(`Socket.io server listening on port ${process.env.PORT}`);
});

// app.listen(port, () => console.log(`listening to ${port} ...`));

// module.exports = app;