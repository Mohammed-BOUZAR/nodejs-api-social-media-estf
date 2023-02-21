const { User } = require('../models/user');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');

router.get('/', isAuth, async (req, res) => {
  const currentUser = req.userId;
  User.find({ _id: { $ne: currentUser } }, (err, users) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: 'Error retrieving users' });
    } else {
      const token = jwt.sign({ userId: currentUser }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      res.cookie('jwt', token, { httpOnly: true });
      res.send({ users, token });
    }
  }).select('first_name last_name email date_birth');
});

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: 'Authentication failed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const currentUser = decoded.userId;

    if (currentUser !== userId) {
      User.findOne({ _id: { $ne: currentUser, $eq: userId } }, (err, user) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error retrieving user' });
        } else if (!user) {
          res.status(404).send({ message: 'User not found' });
        } else {
          console.log(user);
          res.send({ user });
        }
      }).select('first_name last_name email date_birth');
    } else {
      User.findOne({ _id: { $eq: currentUser } }, (err, user) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error retrieving user' });
        } else if (!user) {
          res.status(404).send({ message: 'User not found' });
        } else {
          console.log(user);
          res.send({ user });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).send({ message: 'Authentication failed' });
  }
});

router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, date_birth, state, cin, cne, password } = req.body;

  const updates = {};
  if (first_name) updates.first_name = first_name;
  if (last_name) updates.last_name = last_name;
  if (email) updates.email = email;
  if (date_birth) updates.date_birth = date_birth;
  if (state) updates.state = state;
  if (cin) updates.cin = cin;
  if (cne) updates.cne = cne;
  if (password) updates.password = password;

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: 'Authentication failed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.userId !== userId) {
      return res.status(401).send({ message: 'Authentication failed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Server error' });
  }

  User.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating user' });
      }
      if (!updatedUser) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ updatedUser });
    }
  );
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  // Verify JWT token
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If the decoded user id doesn't match the user id in the request parameter, return unauthorized
    if (decoded.userId !== userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Server error' });
  }

  User.findOneAndDelete({ _id: userId }, (err, deletedUser) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error deleting user' });
    }
    if (!deletedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    // Clear cookie on successful deletion
    res.clearCookie('token');
    res.send({ deletedUser });
  });
});

module.exports = router;