const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const Joi = require("joi");

const adminSchema = new mongoose.Schema({
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
  }
});

adminSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then((result) => {
      this.password = result;
      next();
    }).catch((err) => {
      console.log(err)
      next(err);
    });
});

adminSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

adminSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error());
  } else {
    next(error);
  }
});

// Joi validation schema for adminSchema
const adminJoiSchema = Joi.object({
  first_name: Joi.string().required().min(2).max(50).trim().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name should be at least 2 characters long',
    'string.max': 'First name should be at most 50 characters long'
  }),
  last_name: Joi.string().required().min(2).max(50).trim().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name should be at least 2 characters long',
    'string.max': 'Last name should be at most 50 characters long'
  }),
  email: Joi.string().required().email().trim().lowercase().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email'
  }),
  password: Joi.string().required().min(5).max(100).trim().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password should be at least 5 characters long',
    'string.max': 'Password should be at most 100 characters long'
  })
});

// Validate admin object using Joi
const validateAdmin = (admin) => {
  return adminJoiSchema.validate(admin);
};

const Admin = new mongoose.model('Admin', adminSchema);

module.exports = { Admin, validateAdmin };