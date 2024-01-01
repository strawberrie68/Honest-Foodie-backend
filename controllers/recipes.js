const Recipe = require("../models/Recipe");
const Review = require("../models/Review");
const Comments = require("../models/Comments");
const User = require("../models/User");

module.exports = {
  /* CREATE */

  createRecipe: async (request, response) => {
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
    });

    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: "operation not permitted" });
    }

    recipe.userId = user._id;

    const createdRecipe = await recipe.save();
    user.recipes = user.recipes.concat(createdRecipe._id);
    try {
      const savedUser = await user.save();
      response.status(201).json(createdRecipe);
    } catch (error) {
      response
        .status(500)
        .json({ error: "There was a problem creating the user." });
    }
  },

  createReview: async (request, response) => {
    const recipe = await Recipe.findById(request.params.recipeId);
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: "operation not permitted" });
    }
    const { timesMade, rating, picturePath, userReview, isRecommended } =
      request.body;

    const review = new Review({
      recipeId: recipe._id,
      reviewer: user._id,
      timesMade,
      rating,
      picturePath,
      userReview,
      isRecommended,
    });

    try {
      const createdReview = await review.save();
      user.reviews = user.reviews.concat(createdReview._id);
      await user.save();
      recipe.review = recipe.review.concat(createdReview._id);
      await recipe.save();
      response.status(201).json(createdReview);
    } catch (error) {
      response
        .status(500)
        .json({ error: "There was a problem creating the review." });
    }
  },

  createComment: async (request, response) => {
    const recipe = await Recipe.findById(request.params.id);
    const user = request.user;
    const { parentId, text } = request.body;

    const comment = new Comments({
      recipeId: recipe._id,
      userId: user._id,
      parentId,
      text,
    });

    const createdComment = await comment.save();

    recipe.comments = recipe.comments.concat(createdComment._id);
    await recipe.save();
    response.status(201).json(createdComment);
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
      response.status(200).json(recipe);
    } catch (err) {
      response.status(404).json({ message: err.message });
    }
  },
  getRecipe: async (request, response) => {
    try {
      const { id } = request.params;
      const recipe = await Recipe.findById(id)
        .populate("userId", {
          username: 1,
          firstName: 1,
          lastName: 1,
          picturePath: 1,
        })
        .populate("review", {
          reviewer: 1,
          // TODO need to populate the reviewer with the user info
          timesMade: 1,
          rating: 1,
          picturePath: 1,
          userReview: 1,
          isRecommended: 1,
        })
        .populate("comments", { userId: 1, parentId: 1, text: 1 });

      response.status(200).json(recipe);
    } catch (err) {
      response.status(404).json({ message: err.message });
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
      response.status(200).json(user);
    } catch (err) {
      console.log(err);
    }
  },

  /* UPDATE */

  addToSaveRecipe: async (request, response) => {
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
      response.status(200).json(updatedUser);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  /* DELETE */
  deleteRecipe: async (request, response) => {
    const recipe = await Recipe.findById(request.params.id);

    const user = request.user;

    if (!user || recipe.userId.toString() !== user.id.toString()) {
      return response.status(401).json({ error: "operation not permitted" });
    }

    user.recipes = user.recipes.filter(
      (b) => b.toString() !== recipe.id.toString()
    );

    await user.save();
    await blog.remove();

    response.status(204).end();
  },
};
