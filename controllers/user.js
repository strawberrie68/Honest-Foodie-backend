const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  /* CREATE */
  registerUser: async (req, res) => {
    const {username, firstName, lastName, email, password} = req.body;

    if (!password || password.length < 3) {
      return res.status(400).json({
        error: "`password` is shorter than the minimum allowed length (3)",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      firstName,
      lastName,
      passwordHash,
      email,
    });

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  },

  /* READ */

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({message: err.message});
    }
  },

  getUserFollowers: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },

  getUserFollowings: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },

  /* UPDATE */
  updateUser: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },

  /* DELETE */
  deleteUserFollowings: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },
};
