const mongoose = require("mongoose");
const { reaction } = require("./reaction");

const postSchema = new mongoose.Schema({
  content: {
    type: String
  },
  user: mongoose.Schema.Types.ObjectId,
  date_time: {
    type: Date,
    default: Date.now()
  },
  // reactions: [reaction],
  comment: [{
    // type: Array,
    content: String,
    date_time: {
      type: Date,
      default: Date.now()
    },
    user: mongoose.Schema.Types.ObjectId,
    // reactions: [reaction],
    sub_comment: {
      type: Array,
      content: String,
      user: mongoose.Schema.Types.ObjectId,
      date_time: {
        type: Date,
        default: Date.now()
      },
      reactions: [reaction]
    }
  }]
});

const Post = new mongoose.model('Post', postSchema);

module.exports = { postSchema, Post };