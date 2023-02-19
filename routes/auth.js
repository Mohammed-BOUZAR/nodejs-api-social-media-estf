const { User } = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcryptjs');

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, date_birth, state, cin, cne, password } = req.body;
  User.create({ first_name, last_name, email, date_birth, state, cin, cne, password },
    (err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: 'Error adding new user' });
      } else {
        res.send({ user });
      }
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Server error' });
    }
    if (!user) {
      return res.status(401).send({ message: 'Authentication failed' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: 'Server error' });
      }
      if (!isMatch) {
        return res.status(401).send({ message: 'Authentication failed' });
      }

      req.session.userId = user._id;
      console.log("logged in!")
      console.log(req.session.userId)
      console.log(user._id);
      res.send({ message: 'Logged in successfully' });
    });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send({ message: 'Logged out successfully' });
});


module.exports = router;