const { User } = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


/**
 * Auth
 */

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

router.post('/login', async (req, res) => {
  console.log(req.body);
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
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
      res.cookie('jwt', token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.send({ token });
    });
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.send({ message: 'Logged out successfully' });
});


module.exports = router;


/**
 * {
     "first_name": "Hhhhh",
    "last_name": "Hhhhh",
    "date_birth": "2002-03-09",
    "email": "hhh@hhh.hhh",
    "password": "12345",
    "state": "en attente",
    "cin": "CC231",
    "cne": "EE221"
}
 */