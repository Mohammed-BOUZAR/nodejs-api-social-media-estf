const { User } = require('../models/user');
const router = require('express').Router();

router.get('/', async (req, res) => {
  const currentUser = req.session.userId; // assuming the currently authenticated user is stored in req.user
  User.find({ _id: { $ne: currentUser } }, (err, users) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: 'Error retrieving users' });
    } else {
      res.send({ users });
    }
  }).select('first_name last_name email date_birth');
});

router.get('/:id', async (req, res) => {
  const userId = req.params.id; // Retrieve the user id from the request parameters
  const currentUser = req.session.userId; // assuming the currently authenticated user is stored in req.session.userId
  console.log(req.session.userId)
  console.log(req.params.id)
  if (currentUser) {
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
  else {
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

  User.findOneAndDelete({ _id: userId }, (err, deletedUser) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error deleting user' });
    }
    if (!deletedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send({ deletedUser });
  });
});

module.exports = router;