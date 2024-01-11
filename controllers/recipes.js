const Recipe = require("../models/recipe");
const Review = require("../models/review");
const Comment = require("../models/comment");
const User = require("../models/user");
const STATUS_CODE = require("../shared/errorCode");

module.exports = {
  /* CREATE */

  createRecipe: async (request, response) => {
    try {
      const {
        title,
        picturePath,
        servings,
        steps,
        ingredients,
        time,
        userId,
        tags,
        description,
        isRecommended,
      } = request.body;

      const recipe = new Recipe({
        title,
        picturePath,
        servings,
        steps,
        ingredients,
        time,
        userId,
        tags,
        description,
        reviews: [],
        comments: [],
        isRecommended,
      });

      const user = request.user;
      if (!user) {
        return response
          .status(STATUS_CODE.NOT_AUTHORIZED)
          .json({ error: "operation not permitted" });
      }

      recipe.userId = user._id;

      let createdRecipe = await recipe.save();
      user.recipes = user.recipes.concat(createdRecipe._id);
      await user.save();
      response.status(STATUS_CODE.CREATED).json(createdRecipe);
    } catch (error) {
      response
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: `${error} "There was a problem creating the recipe" ` });
    }
  },

  createReview: async (request, response) => {
    try {
      const recipe = await Recipe.findById(request.params.recipeId);
      const user = request.user;

      if (!user) {
        return response
          .status(STATUS_CODE.NOT_AUTHORIZED)
          .json({ error: "operation not permitted" });
      }
      const { timesMade, rating, picturePath, userReview, isRecommended } =
        request.body;

      const review = new Review({
        recipeId: recipe._id,
        reviewerId: user._id,
        timesMade,
        rating,
        picturePath,
        userReview,
        isRecommended,
      });

      const createdReview = await review.save();
      user.reviews = user.reviews.concat(createdReview._id);
      await user.save();
      recipe.reviews = recipe.reviews.concat(createdReview._id);
      await recipe.save();
      response.status(STATUS_CODE.CREATED).json(createdReview);
    } catch (error) {
      response
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: ` ${error} There was a problem creating the review."` });
    }
  },

  createComment: async (request, response) => {
    try {
      const { recipeId } = request.params;
      const recipe = await Recipe.findById(recipeId);
      const user = request.user;
      const { parentId, text } = request.body;

      if (!text) {
        return response
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: "Missing comment" });
      }

      const comment = new Comment({
        recipeId: recipe._id,
        userId: user._id,
        parentId,
        text,
      });

      const createdComment = await comment.save();

      recipe.comments = recipe.comments.concat(createdComment._id);
      await recipe.save();
      response.status(STATUS_CODE.CREATED).json(createdComment);
    } catch (error) {
      response.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        error: `${error} "There was a problem creating the comment."`,
      });
    }
  },

  /* READ */

  getFeedRecipes: async (request, response) => {
    try {
      const recipe = await Recipe.find().populate("userId", {
        username: 1,
        firstName: 1,
        lastName: 1,
        picturePath: 1,
      });
      response.status(STATUS_CODE.OK).json(recipe);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },
  getRecipe: async (request, response) => {
    try {
      const { recipeId } = request.params;
      const recipe = await Recipe.findById(recipeId)
        .populate("userId", {
          username: 1,
          firstName: 1,
          lastName: 1,
          picturePath: 1,
        })
        .populate("reviews", {
          reviewer: 1,
          // TODO need to populate the reviewer with the user info
          timesMade: 1,
          rating: 1,
          picturePath: 1,
          userReview: 1,
          isRecommended: 1,
        })
        .populate("comments", { userId: 1, parentId: 1, text: 1 });

      response.status(STATUS_CODE.OK).json(recipe);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },

  getUserRecipes: async (request, response) => {
    try {
      const { userId } = request.params;
      const user = await User.findById(userId).populate("recipes", {
        title: 1,
        picturePath: 1,
        tags: 1,
        userId: 1,
      });
      response.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },

  /* UPDATE */
  updateRecipe: async (request, response) => {
    try {
      const {
        title,
        picturePath,
        servings,
        steps,
        ingredients,
        time,
        userId,
        tags,
        isRecommended,
        comments,
        reviews,
        description,
      } = request.body;

      let updatedRecipe = await Recipe.findByIdAndUpdate(
        request.params.recipeId,
        {
          title,
          picturePath,
          servings,
          steps,
          ingredients,
          time,
          userId,
          tags,
          isRecommended,
          comments,
          reviews,
          description,
        },
        { new: true }
      );

      // updatedRecipe = await Recipe.findById(updatedRecipe._id)
      //   .populate("comments")
      //   .populate("review");

      response.status(STATUS_CODE.OK).json(updatedRecipe);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },

  toggleSavedRecipe: async (request, response) => {
    try {
      const user = await User.findById(request.user._id);
      const isLiked = user.savedRecipe.get(id);

      if (isLiked) {
        user.savedRecipe.delete(id);
      } else {
        user.savedRecipe.set(id, true);
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { savedRecipe: user.savedRecipe },
        { new: true }
      );
      response.status(STATUS_CODE.OK).json(updatedUser);
    } catch (err) {
      response.status(STATUS_CODE.NOT_FOUND).json({ message: err.message });
    }
  },

  /* DELETE */
  deleteRecipe: async (request, response) => {
    try {
      const { recipeId } = request.params;
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return response
          .status(STATUS_CODE.NOT_FOUND)
          .json({ error: "recipe not found" });
      }

      const user = request.user;

      if (!user || recipe.userId.toString() !== user.id.toString()) {
        return response.status(401).json({ error: "operation not permitted" });
      }

      user.recipes = user.recipes.filter(
        (b) => b.toString() !== recipe.id.toString()
      );

      await Recipe.deleteOne({ _id: recipeId });
      await user.save();

      response.status(STATUS_CODE.NO_CONTENT).end();
    } catch (err) {
      response
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    }
  },
};
