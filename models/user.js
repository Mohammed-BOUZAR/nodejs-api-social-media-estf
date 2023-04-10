const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "enter a valid first name"],
    minlength: [3, "First name should be at least 2 characters long"],
    maxlength: [50, "First name should be at most 50 characters long"],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, "enter a valid last name"],
    minlength: [2, "Last name should be at least 2 characters long"],
    maxlength: [50, "Last name should be at most 50 characters long"],
    trim: true
  },
  date_birth: {
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
  departement: {
    type: String,
    // required: true
  },
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
  }],
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }]
});

userSchema.set('toObject', { populate: 'posts' });
userSchema.set('toJSON', { populate: 'posts' });

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

const userJoiSchema = Joi.object({
  first_name: Joi.string().required().min(2).max(50).trim().messages({
    'any.required': 'Enter a valid first name',
    'string.empty': 'First name is required',
    'string.min': 'First name should be at least 2 characters long',
    'string.max': 'First name should be at most 50 characters long'
  }),
  last_name: Joi.string().required().min(2).max(50).trim().messages({
    'any.required': 'Enter a valid last name',
    'string.empty': 'Last name is required',
    'string.min': 'Last name should be at least 2 characters long',
    'string.max': 'Last name should be at most 50 characters long'
  }),
  date_birth: Joi.date().required().messages({
    'any.required': 'Enter a valid date of birth'
  }),
  email: Joi.string().required().email().trim().lowercase().messages({
    'any.required': 'Enter a valid email',
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email'
  }),
  password: Joi.string().required().min(5).max(100).trim().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.min': 'Password should be at least 5 characters long',
    'string.max': 'Password should be at most 100 characters long'
  }),
  state: Joi.string().required().valid('actif', 'en attente', 'inactif').messages({
    'any.required': 'Enter a valid state',
    'any.only': "State must be 'actif', 'en attente', or 'inactif'"
  }),
  cin: Joi.string().required().messages({
    'any.required': 'Enter a valid CIN',
    'string.empty': 'CIN is required'
  }),
  cne: Joi.string().required().messages({
    'any.required': 'Enter a valid CNE',
    'string.empty': 'CNE is required'
  }),
  profile: Joi.string()
  // departement: Joi.string().required().messages({
  //   'any.required': 'Enter a valid Departement',
  //   'string.empty': 'Departement is required'
  // })
});

// Validate user object using Joi
const validateUser = (user) => {
  return userJoiSchema.validate(user);
};


const User = new mongoose.model('User', userSchema);

module.exports = { userSchema, User, validateUser };