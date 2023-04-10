const { User, validateUser } = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.authRegister = async (req, res) => {
    // console.log("auth register");
    let { first_name, last_name, email, date_birth, state, profile, cin, cne, password } = req.body;
    console.log(req.body);
    try {
        const result = validateUser({ first_name, last_name, email, date_birth, state, profile, cin, cne, password });
        if (result.error) {
            // If there are validation errors, send an error response
            res.status(400).json({ error: result.error.details.map((d) => d.message) });
        } else {
            // If there are no validation errors, create the admin object
            // console.log({ first_name, last_name, email, date_birth, state, profile, cin, cne, password });
            let user = await User.findOne({
                $or: [{ email }, { cin }, { cne }] // Use $or operator to search for any of the fields
            });
            if (user) return res.status(400).json({ message: 'Already exist!' });
            user = await User.create({ first_name, last_name, email, date_birth, state, profile, cin, cne, password });
            ({ first_name, last_name, email, date_birth, state, profile, cin, cne } = user);
            res.status(201).json({ first_name, last_name, email, date_birth, state, profile, cin, cne });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error adding new user' });
    }
};

module.exports.authLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    User.findOne({ email }, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Server error' });
        }
        if (!user) {
            console.log("user not exist");
            return res.status(401).send({ message: 'Authentication failed' });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Server error' });
            }
            if (!isMatch) {
                console.log("in not match");
                return res.status(401).send({ message: 'Authentication failed' });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
            console.log("token", token);
            // res.cookie('jwt', token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.send({ token });
        });
    });
};

module.exports.authLogout = (req, res) => {
    // console.log("auth logout");
    res.clearCookie('jwt');
    res.send({ message: 'Logged out successfully' });
};