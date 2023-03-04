const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const posts = require('./routes/posts');
const auth = require('./routes/auth');
const users = require('./routes/users');

// const port = process.env.PORT;



const app = express();



app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/posts", posts);

app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found!" });
});

// app.listen(port, () => console.log(`listening to ${port} ...`));

module.exports = app;