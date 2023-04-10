const mongoose = require("mongoose");
const { reactionSchema } = require("./reaction");
const { subCommentSchema } = require("./subComment");


module.exports.commentSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: [1, "Comment content should not be empty"]
  },
  date_time: {
    type: Date,
    default: Date.now()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reactions: [reactionSchema],
  subComments: [subCommentSchema]
});

module.exports.commentSchema.post('save', function (error, doc, next) {
  if (error.name === 'ValidationError') {
    // Handle validation error
    next(new Error('Invalid comment data'));
  } else {
    // Pass on other errors
    next(error);
  }
});
