const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.getUsers = async (req, res) => {
    const currentUser = req.userId;
    User.find({ _id: { $ne: currentUser } }, (err, users) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error retrieving users' });
        } else {
            const token = jwt.sign({ userId: currentUser }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            res.cookie('jwt', token, { httpOnly: true });
            res.send({ users });
        }
    }).select('firstName lastName email dateBirth profile');
};

module.exports.getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const currentUser = req.userId;

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
            })
                .select('firstName lastName email dateBirth profile');
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
};

module.exports.putUser = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, dateBirth, state, cin, cne, password } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (dateBirth) updates.dateBirth = dateBirth;
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
};

module.exports.deleteUser = async (req, res) => {
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
};