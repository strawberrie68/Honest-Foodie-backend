const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  /* CREATE */
  registerUser: async (request, response) => {
    const {username, firstName, lastName, email, password} = request.body;

    if (!password || password.length < 3) {
      return response.status(400).json({
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

    response.status(201).json(savedUser);
  },

  /* READ */
  getUsers: async (request, response) => {
    try {
      const user = await User.find({});
      response.status(200).json(user);
    } catch (err) {
      response.status(404).json({message: err.message});
    }
  },

  getUser: async (request, response) => {
    try {
      const user = await User.findById(request.params.id)
        .populate("recipes", {
          title: 1,
          picturePath: 1,
        })
        .populate("reviews", {
          recipeId: 1,
          timesMade: 1,
          rating: 1,
          picturePath: 1,
        })
        .populate("user", {following: 1, followers: 1});
      response.status(200).json(user);
    } catch (err) {
      response.status(404).json({message: err.message});
    }
  },

  getUserFollowers: async (request, response) => {
    try {
      const followers = await User.findById(request.params.id).populate(
        "user",
        {followers: 1}
      );
      response.status(200).json(followers);
    } catch (err) {
      console.log(err);
    }
  },

  getUserFollowings: async (request, response) => {
    try {
      const following = await User.findById(request.params.id).populate(
        "user",
        {following: 1}
      );
      response.status(200).json(following);
    } catch (err) {
      console.log(err);
    }
  },

  /* UPDATE */
  updateUser: async (request, response) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },

  addRemoveFollowing: async (request, response) => {
    try {
      const {userfollowingId} = request.params;
      const userId = request.user._id;

      const user = await User.find(userId);
      const userFollowing = await User.find(userfollowingId);

      const isFollowing = user.following.includes(userfollowingId);

      if (!user) {
        return response.status(401).json({error: "operation not permitted"});
      }

      if (isFollowing) {
        user.following = user.following.filter((id) => id !== userfollowingId);
        userFollowing.followers = userFollowing.followers.filter(
          (id) => id !== userId
        );
      } else {
        user.following.push(userfollowingId);
        userFollowing.followers.push(userId);
      }

      await user.save();
      await userFollowing.save();

      const following = await Promise.all(
        user.following.map((id) => User.findById(id))
      );
      const formattedFollowings = following.map(
        ({_id, firstName, lastName, username, picturePath}) => {
          return {_id, firstName, lastName, username, picturePath};
        }
      );
      res.status(200).json(formattedFollowings);

      response.status(200).json(updatedFollowing);
      response.status(200).json(updatedFollowers);
    } catch (err) {
      response.status(404).json({message: err.message});
    }
  },
};
