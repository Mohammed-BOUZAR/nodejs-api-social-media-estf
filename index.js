
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
const admin = require('./routes/admin');
const users = require('./routes/users');
const posts = require('./routes/posts');
const conversations = require('./routes/conversations');
const notifications = require('./routes/notifications');

const { isToken } = require('./middleware/token');

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));

app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/users", isToken, users);
app.use("/api/posts", isToken, posts);
app.use("/api/notifications", isToken, notifications);
app.use("/api/conversations", isToken, conversations);

app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found!" });
});

module.exports = app;