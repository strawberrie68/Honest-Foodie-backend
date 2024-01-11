const User = require("../models/user");
const bcrypt = require("bcrypt");

const STATUS_CODE = require("../shared/errorCode");

module.exports = {
  /* CREATE */
  registerUser: async (request, response) => {
    try {
      const { username, firstName, lastName, email, password } = request.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(STATUS_CODE.BAD_REQUEST).json({
          error: "Username already exists",
        });
      }

      if (!password || password.length < 3) {
        return response.status(STATUS_CODE.BAD_REQUEST).json({
          error: "`password` is shorter than the minimum allowed length (3)",
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        firstName,
        lastName,
        password: passwordHash,
        email,
      });

      const savedUser = await user.save();
      response.status(STATUS_CODE.CREATED).json(savedUser);
    } catch (err) {
      response.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
    }
  },

  /* READ */
  getUsers: async (request, response) => {
    try {
      // const { userId } = request.params;
      const user = await User.find({})
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
      response.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },

  getUser: async (request, response) => {
    try {
      const { userId } = request.params;
      const user = await User.findById(userId)
        .populate("recipes", {
          title: 1,
          picturePath: 1,
        })
        .populate("reviews", {
          recipeId: 1,
          timesMade: 1,
          rating: 1,
          picturePath: 1,
        });

      if (!user) {
        return response
          .status(STATUS_CODE.NOT_FOUND)
          .json({ message: "User not found" });
      }
      //TO DO
      // .populate("user", {following: 1, followers: 1});
      response.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      response.status(STATUS_CODE.BAD_REQUEST).json({ message: err.message });
    }
  },

  getUserFollowers: async (request, response) => {
    try {
      const { id } = request.params;
      const followers = await User.findById(id).populate("user", {
        followers: 1,
      });
      response.status(STATUS_CODE.OK).json(followers);
    } catch (err) {
      response.status(STATUS_CODE.BAD_REQUEST).json({ message: err.message });
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
      response.status(STATUS_CODE.BAD_REQUEST).json({ message: err.message });
    }
  },

  /* UPDATE */
  updateUser: async (request, response) => {
    const { firstName, lastName, email, picturePath } = request.body;

    const user = request.user;

    if (!user) {
      return response
        .status(STATUS_CODE.NOT_AUTHORIZED)
        .json({ error: "operation not permitted" });
    }

    let updatedUser = await User.findByIdAndUpdate(
      request.params.userId,
      { firstName, lastName, email, picturePath },
      { new: true }
    );

    updatedUser = await User.findById(updatedUser._id)
      .populate("following")
      .populate("followers")
      .populate("recipes")
      .populate("reviews")
      .populate("savedRecipe");

    response.json(updatedUser);
  },

  toggleFollowing: async (request, response) => {
    try {
      const { userFollowingId } = request.params;
      const userId = request.user._id;

      const user = await User.find(userId);
      const userFollowing = await User.find(userFollowingId);

      const isFollowing = user.following.includes(userFollowingId);

      if (!user) {
        return response
          .status(STATUS_CODE.NOT_AUTHORIZED)
          .json({ error: "operation not permitted" });
      }

      if (isFollowing) {
        user.following = user.following.filter((id) => id !== userFollowingId);
        userFollowing.followers = userFollowing.followers.filter(
          (id) => id !== userId
        );
      } else {
        user.following.push(userFollowingId);
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
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },
};
