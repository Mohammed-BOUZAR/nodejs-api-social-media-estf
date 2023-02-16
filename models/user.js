const mongoose = require("mongoose");
const { postSchema } = require("./post");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    // required: true
  },
  date_naissance: {
    type: Date,
    // required: true
  },
  password: {
    type: String,
    // required: true
  },
  etat: {
    type: String,
    // required: true
  },
  cin: {
    type: String,
    // required: true
  },
  cne: {
    type: String,
    // required: true
  },
  posts: [mongoose.Schema.Types.ObjectId]
});

const User = new mongoose.model('User', userSchema);

module.exports = { userSchema, User };