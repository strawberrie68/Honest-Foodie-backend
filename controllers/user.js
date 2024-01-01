const User = require("../models/User");
const bcrypt = require("bcrypt");
const recipes = require("./recipes");

// const populateObj = {
//   path: "recipes",
//   populate: {
//     path: "userId",
//     select: "firstName",
//   },
//   select: "recipes",
// };

module.exports = {
  /* CREATE */
  registerUser: async (request, response) => {
    try {
      const { username, firstName, lastName, email, password } = request.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log("User already exists:", username); // Add this line
        return response.status(400).json({
          error: "Username already exists",
        });
      }

      if (!password || password.length < 3) {
        return response.status(400).json({
          error: "`password` is shorter than the minimum allowed length (3)",
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        username,
        firstName,
        lastName,
        password: passwordHash,
        email,
      });

      const savedUser = await newUser.save();
      response.status(201).json(savedUser);
    } catch (err) {
      console.log("Error registering user:", err); // Add this line
      response.status(500).json({ message: err.message });
    }
  },

  /* READ */

  getUser: async (request, response) => {
    try {
      const { userId } = request.params;
      const user = await User.findById(userId)
        .populate("recipes", {
          title: 1,
          picturePath: 1,
          userId: 1,
          description: 1,
        })
        // .populate({
        //   path: "recipes",
        //   populate: {
        //     path: "userId",
        //     model: "User",
        //     select: "firstName",
        //   },
        // })
        .populate("reviews", {
          recipeId: 1,
          timesMade: 1,
          rating: 1,
          picturePath: 1,
        });

      // .populate("user", {following: 1, followers: 1});
      response.status(200).json(user);
    } catch (err) {
      response.status(404).json({ message: err.message });
    }
  },

  getUserFollowers: async (request, response) => {
    try {
      const { id } = request.params;
      const followers = await User.findById(id).populate("user", {
        followers: 1,
      });
      response.status(200).json(followers);
    } catch (err) {
      console.log(err);
    }
  },

  getUserFollowings: async (request, response) => {
    try {
      const { id } = request.params;
      const following = await User.findById(id).populate("user", {
        following: 1,
      });
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
      const { userfollowingId } = request.params;
      const userId = request.user._id;

      const user = await User.find(userId);
      const userFollowing = await User.find(userfollowingId);

      const isFollowing = user.following.includes(userfollowingId);

      if (!user) {
        return responseponse
          .status(401)
          .json({ error: "operation not permitted" });
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
        ({ _id, firstName, lastName, username, picturePath }) => {
          return { _id, firstName, lastName, username, picturePath };
        }
      );
      res.status(200).json(formattedFollowings);

      response.status(200).json(updatedFollowing);
      response.status(200).json(updatedFollowers);
    } catch (err) {
      response.status(404).json({ message: err.message });
    }
  },
};
