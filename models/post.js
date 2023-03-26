const mongoose = require("mongoose");
const { commentSchema } = require("./comment");
const { reactionSchema } = require("./reaction");
// const { User } = require("./user");

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
  this.populate("user", "_id firstName lastName");
  this.populate("comments.user", "_id firstName lastName");
  next();
};

/* We're going to need to populate the 'postedBy' field virtually every time we do a findOne / find query, so we'll just do it as a pre hook here upon creating the schema */
postSchema
  .pre("findOne", autoPopulatePostedBy)
  .pre("find", autoPopulatePostedBy)
  .pre("findByIdAndUpdate", autoPopulatePostedBy);

const Post = new mongoose.model('Post', postSchema);

module.exports = { postSchema, Post };