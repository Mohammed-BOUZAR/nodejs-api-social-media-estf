const mongoose = require('mongoose');
// const { User } = require('./user');

const conversationSchema = new mongoose.Schema({
  name: String,
  participant: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    date: {
      type: Date,
      default: Date.now()
    },
    unread: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  })]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = {
  Conversation,
  conversationSchema
}