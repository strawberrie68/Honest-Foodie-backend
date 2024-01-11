const User = require("../models/User");
const bcrypt = require("bcrypt");

const STATUS_CODE = require("../shared/errorCode");

module.exports = {
  /* CREATE */
  registerUser: async (request, response) => {
    const {username, firstName, lastName, email, password} = request.body;

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
      passwordHash,
      email,
    });

    const savedUser = await user.save();

    response.status(STATUS_CODE.CREATED).json(savedUser);
  },

  /* READ */
  getUsers: async (request, response) => {
    try {
      const user = await User.find({})
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
      // .populate("user", {following: 1, followers: 1});
      response.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({message: err.message});
    }
  },

  getUser: async (request, response) => {
    try {
      const user = await User.findById(request.params.userId)
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
      //TO DO
      // .populate("user", {following: 1, followers: 1});
      response.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({message: err.message});
    }
  },

  getUserFollowers: async (request, response) => {
    try {
      const followers = await User.findById(request.params.userId).populate(
        "user",
        {followers: 1}
      );
      response.status(STATUS_CODE.OK).json(followers);
    } catch (err) {
      console.log(err);
    }
  },

  getUserFollowings: async (request, response) => {
    try {
      const following = await User.findById(request.params.userId).populate(
        "user",
        {following: 1}
      );
      response.status(STATUS_CODE.OK).json(following);
    } catch (err) {
      console.log(err);
    }
  },

  /* UPDATE */
  updateUser: async (request, response) => {
    const {firstName, lastName, email, picturePath} = request.body;

    const user = request.user;

    if (!user) {
      return response
        .status(STATUS_CODE.NOT_AUTHORIZED)
        .json({error: "operation not permitted"});
    }

    let updatedUser = await User.findByIdAndUpdate(
      request.params.userId,
      {firstName, lastName, email, picturePath},
      {new: true}
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
      const {userfollowingId} = request.params;
      const userId = request.user._id;

      const user = await User.find(userId);
      const userFollowing = await User.find(userfollowingId);

      const isFollowing = user.following.includes(userfollowingId);

      if (!user) {
        return response
          .status(STATUS_CODE.NOT_AUTHORIZED)
          .json({error: "operation not permitted"});
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

      response.status(STATUS_CODE.OK).json(formattedFollowings);
      response.status(STATUS_CODE.OK).json(updatedFollowing);
      response.status(STATUS_CODE.OK).json(updatedFollowers);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({message: err.message});
    }
  },
};
