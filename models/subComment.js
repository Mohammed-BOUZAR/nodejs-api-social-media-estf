const mongoose = require("mongoose");
const { reactionSchema } = require("./reaction");

module.exports.subCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: [1, "Replay content should not be empty"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date_time: {
    type: Date,
    default: Date.now()
  },
  reactions: [reactionSchema]
});

module.exports.subCommentSchema.post('save', function (error, doc, next) {
  if (error.name === 'ValidationError') {
    // Handle validation error
    next(new Error('Invalid sub-comment data'));
  } else {
    // Pass on other errors
    next(error);
  }
});