const mongoose = require("mongoose");
// const { Conversation } = require("./conversation");
const { postSchema } = require("./post");
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "enter a valid first name"],
    minlength: [3, "First name should be at least 2 characters long"],
    maxlength: [50, "First name should be at most 50 characters long"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "enter a valid last name"],
    minlength: [2, "Last name should be at least 2 characters long"],
    maxlength: [50, "Last name should be at most 50 characters long"],
    trim: true
  },
  dateBirth: {
    type: Date,
    required: [true, "enter a valid date of birth"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "enter a valid email"],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [5, "Password should be at least 5 characters long"],
    maxlength: [1024, "Password should be at most 100 characters long"],
    trim: true
  },
  state: {
    type: String,
    required: [true, "Enter a valid state"],
    enum: {
      values: ['actif', 'en attente', 'inactif'],
      message: "State must be 'actif', 'en attente', or 'inactif'"
    }
  },
  cin: {
    type: String,
    required: [true, 'enter a valid CIN']
  },
  cne: {
    type: String,
    required: [true, 'enter a valid CNE']
  },
  profile: String,
  notifications: [new mongoose.Schema({
    type: String,
    content: String,
    url: String,
    state: {
      type: String,
      enum: ['unread', 'viewed', 'read']
    },
    date_time: {
      type: Date,
      default: Date.now()
    }
  })],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

userSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then((result) => {
      this.password = result;
      next();
    }).catch((err) => {
      console.log(err)
      next(err);
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email or CIN or CNE already exists'));
  } else {
    next(error);
  }
});

const User = new mongoose.model('User', userSchema);

module.exports = { userSchema, User };