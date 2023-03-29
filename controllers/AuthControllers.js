const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.authRegister = async (req, res) => {
    const { firstName, lastName, email, dateBirth, state, cin, cne, password } = req.body;
    User.create({ firstName, lastName, email, dateBirth, state, cin, cne, password },
        (err, user) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error adding new user' });
            } else {
                const { firstName, lastName, email, dateBirth, state, cin, cne } = user;
                res.send({ firstName, lastName, email, dateBirth, state, cin, cne });
            }
        });
};

module.exports.authLogin = async (req, res) => {
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
};

module.exports.authLogout = (req, res) => {
    res.clearCookie('jwt');
    res.send({ message: 'Logged out successfully' });
};