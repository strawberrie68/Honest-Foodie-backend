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
  // following: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  // followers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  following: { type: Map, of: Boolean },
  followers: { type: Map, of: Boolean },
  email: { type: String, required: true },
  password: String,
  picturePath: {
    type: String,
    default: "",
  },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  savedRecipe: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  flavorProfile: { type: Array, default: [] },
  caption: String,
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.password;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
