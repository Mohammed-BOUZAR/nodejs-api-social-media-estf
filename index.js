
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

// Set the 'Access-Control-Allow-Origin' header to allow requests from http://localhost:8100
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Set other CORS headers as needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

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