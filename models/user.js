const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  following: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  follower: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  email: String,
  password: String,
  picturePath: {
    type: String,
    default: "",
  },
  savedRecipe: [{type: mongoose.Schema.Types.ObjectId, ref: "Recipe"}],
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref: "Review"}],
  flavorProfile: {type: Array, default: []},
  caption: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
