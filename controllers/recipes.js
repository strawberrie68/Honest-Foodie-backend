const Recipe = require("../models/Recipe");
const Review = require("../models/Review");
const Comment = require("../models/Comments");
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
    });

    const user = request.user;
    if (!user) {
      return response.status(401).json({error: "operation not permitted"});
    }

    recipe.userId = user._id;

    let createdRecipe = await recipe.save();
    user.recipes = user.recipes.concat(createdRecipe._id);

    createdRecipe = await Recipe.findById(createdRecipe._id);

    response.status(201).json(createdRecipe);
  },

  createReview: async (request, response) => {
    const recipe = await Recipe.findById(request.params.id);
    const user = request.user;

    const {timesMade, rating, picturePath} = request.body;

    const review = new Review({
      recipeId: recipe._id,
      reviewer: user._id,
      timesMade,
      rating,
      picturePath,
    });
    const createdReview = await review.save();
    user.reviews = user.reviews.concat(createdReview._id);
    await user.save();
    recipe.review = recipe.review.concat(createdReview._id);
    await recipe.save();

    response.status(201).json(createdReview);
  },

  createComment: async (request, response) => {
    const recipe = await Recipe.findById(request.params.id);
    const user = request.user;
    const {parentId, text} = request.body;

    const comment = new Comment({
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

  /* Returns all recipes to be used in the feed */

  getFeedRecipes: async (request, response) => {
    try {
      const recipe = await Recipe.find();
      response.status(200).json(recipe);
    } catch (err) {
      response.status(404).json({message: err.message});
    }
  },

  /* Returns one specfic recipe */

  getRecipe: async (request, response) => {
    try {
      const recipe = await Recipe.findById(request.params.id)
        .populate("review", {
          reviewer: 1,
          timesMade: 1,
          rating: 1,
          picturePath: 1,
        })
        .populate("comments", {userId: 1, parentId: 1, text: 1});

      response.status(200).json(recipe);
    } catch (err) {
      response.status(404).json({message: err.message});
    }
  },

  getUserRecipes: async (request, response) => {
    try {
      const user = await User.findById(request.params.id).populate("recipe", {
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

  toggleSavedRecipe: async (request, response) => {
    try {
      const {id} = request.params;

      const user = await User.findById(request.user._id);
      const isLiked = user.savedRecipe.get(id);

      if (isLiked) {
        user.savedRecipe.delete(id);
      } else {
        user.savedRecipe.set(id, true);
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {savedRecipe: user.savedRecipe},
        {new: true}
      );
      response.status(200).json(updatedUser);
    } catch (err) {
      res.status(404).json({message: err.message});
    }
  },

  updateRecipe: async (request, response) => {
    const {
      title,
      picturePath,
      servings,
      steps,
      ingredients,
      time,
      userId,
      tags,
    } = request.body;

    let updatedRecipe = await Recipe.findByIdAndUpdate(
      request.params.id,
      {
        title,
        picturePath,
        servings,
        steps,
        ingredients,
        time,
        userId,
        tags,
      },
      {new: true}
    );

    updatedRecipe = await Recipe.findById(updatedRecipe._id)
      .populate("comments")
      .populate("review");

    response.json(updatedRecipe);
  },

  /* DELETE */
  deleteRecipe: async (request, response) => {
    const recipe = await Recipe.findById(request.params.id);

    const user = request.user;

    if (!user || recipe.userId.toString() !== user.id.toString()) {
      return response.status(401).json({error: "operation not permitted"});
    }

    user.recipes = user.recipes.filter(
      (b) => b.toString() !== recipe.id.toString()
    );

    await user.save();
    await recipe.remove();

    response.status(204).end();
  },
};
