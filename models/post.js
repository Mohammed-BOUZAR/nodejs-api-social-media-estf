const mongoose = require("mongoose");
const { commentSchema } = require("./comment");
const { reactionSchema } = require("./reaction");
const Joi = require("joi");

const postSchema = new mongoose.Schema({
  content: {
    type: String
  },
  links: [{
    extname: String,
    name: String,
    path: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date_time: {
    type: Date,
    default: Date.now()
  },
  // state: {
  //   type: String,
  //   required: [true, "Enter a valid state"],
  //   enum: ['actif', 'en attente', 'inactif']
  // },
  reactions: [reactionSchema],
  comments: [commentSchema]
}, { strictPopulate: false });

postSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    // Handle duplicate key error
    next(new Error('Post already exists'));
  } else {
    // Pass on other errors
    next(error);
  }
});

postSchema.post('findOneAndUpdate', function (error, doc, next) {
  if (error.name === 'CastError') {
    // Handle cast error
    next(new Error('Invalid post ID'));
  } else {
    // Pass on other errors
    next(error);
  }
});

/* Kind of like a middleware function after creating our schema (since we have access to next) */
/* Must be a function declaration (not an arrow function), because we want to use 'this' to reference our schema */
const autoPopulatePostedBy = function(next) {
  this.populate("user", "_id first_name last_name profile");
  this.populate("comments.user", "_id first_name last_name profile");
  this.populate("comments.subComments.user", "_id first_name last_name profile");
  next();
};

/* We're going to need to populate the 'postedBy' field virtually every time we do a findOne / find query, so we'll just do it as a pre hook here upon creating the schema */
postSchema
  .pre("findOne", autoPopulatePostedBy)
  .pre("find", autoPopulatePostedBy)
  .pre("findByIdAndUpdate", autoPopulatePostedBy);

  const userJoiSchema = Joi.object({
    content: Joi.string().min(2).max(50).trim().messages({
      'string.max': 'First name should be at most 500 characters long'
    }),
    // state: Joi.string().required().valid('actif', 'en attente', 'inactif').messages({
    //   'any.required': 'Enter a valid state',
    //   'any.only': "State must be 'actif', 'en attente', or 'inactif'"
    // })
  });
  
  // Validate user object using Joi
  const validatePost = (user) => {
    return userJoiSchema.validate(user);
  };

const Post = new mongoose.model('Post', postSchema);

module.exports = { postSchema, Post };