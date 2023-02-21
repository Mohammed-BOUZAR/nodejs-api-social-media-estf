const mongoose = require("mongoose");
const { commentSchema } = require("./comment");
const { reactionSchema } = require("./reaction");
// const { User } = require("./user");

const postSchema = new mongoose.Schema({
  content: {
    type: String
  },
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
});

postSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    // Handle duplicate key error
    next(new Error('Post already exists'));
  } else {
    // Pass on other errors
    next(error);
  }
});

postSchema.post('findOneAndUpdate', function(error, doc, next) {
  if (error.name === 'CastError') {
    // Handle cast error
    next(new Error('Invalid post ID'));
  } else {
    // Pass on other errors
    next(error);
  }
});

const Post = new mongoose.model('Post', postSchema);

module.exports = { postSchema, Post };