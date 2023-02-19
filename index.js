const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const posts = require('./routes/posts');
const auth = require('./routes/auth');
const users = require('./routes/users');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/pfe')
  .then(() => console.log("mongodb connected!"))
  .catch(err => console.log("mongodb not connected!"))

const app = express();
app.use(express.json());
app.use(session({
  secret: "key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true
  }
}))

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/posts", posts);

app.use((req, res) => {
  res.status(404).json({message: "not found!"});
});

app.listen(3000, () => console.log("listening to 3000 ..."));