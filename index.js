const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const { User } = require('./models/user');
const { Post } = require('./models/post');
const posts = require('./routes/posts');
const users = require('./routes/users');

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
// app.use((req, res, next) => {
//   req.session.userId = "63ed42e00a4f4ac19440f57d"
//   console.log(req.session.userId);
//   next()
// })
app.use("/", users);

// app.use((req, res, next) => {
//   if (req.session.userId)
//     return next();
//   else
//     return res.status(400).json({ message: "you need to connect!" });
// });

app.use("/posts", posts);

app.use((req, res) => {
  res.status(404).json("not found!")
});

app.listen(3000, () => console.log("listening to 3000 ..."));