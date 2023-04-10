const mongoose = require("mongoose");

module.exports.reactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['like', 'disLike', 'love', 'haha', 'wow', 'sad', 'angry', 'care']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date_time: {
    type: Date,
    default: Date.now()
  }
});

module.exports.reactionSchema.post('save', function (error, doc, next) {
  if (error.name === 'ValidationError') {
    // Handle validation error
    next(new Error('Invalid reaction data'));
  } else {
    // Pass on other errors
    next(error);
  }
});