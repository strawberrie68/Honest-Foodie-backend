const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: { type: Map, of: Boolean },
  followers: { type: Map, of: Boolean },
  email: { type: String, required: true },
  password: String,
  picturePath: {
    type: String,
    default: "",
  },
  recipes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    default: [],
  },
  savedRecipe: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  reviews: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    default: [],
  },
  flavorProfile: { type: Array, default: [] },
  caption: String,
});

// userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;
