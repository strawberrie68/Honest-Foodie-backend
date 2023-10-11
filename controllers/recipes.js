const Recipe = require("../models/Recipe");
const Review = require("../models/Review");
const Comments = require("../models/Comments");

module.exports = {
  /* CREATE */

  createRecipe: async (req, res) => {
    const {
      title,
      picturePath,
      servings,
      steps,
      ingredients,
      time,
      urserId,
      isRecommended,
      comments,
      review,
      tags,
    } = req.body;

    const recipe = new Recipe({
      title,
      picturePath,
      servings,
      steps,
      ingredients,
      time,
      urserId,
      isRecommended,
      comments,
      review,
      tags,
    });
    const createdRecipe = await recipe.save();
    res.status(201).json(createdRecipe);
  },
  createReview: async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    const {reviewer, timesMade, rating, picturePath} = req.body;

    const review = new Review({
      recipeId: recipe._id,
      reviewer,
      timesMade,
      rating,
      picturePath,
    });
    const createdReview = await review.save();

    recipe.review = recipe.review.concat(createdReview._id);
    await recipe.save();

    res.status(201).json(createdReview);
  },
  createComment: async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    const {userId, parentId, text} = req.body;

    const comment = new Comments({
      recipeId: recipe._id,
      userId,
      parentId,
      text,
    });

    const createdComment = await comment.save();

    recipe.comments = recipe.comments.concat(createdComment._id);
    await recipe.save();
    res.status(201).json(createdComment);
  },

  /* READ */

  getFeedRecipes: async (req, res) => {
    try {
      const recipe = await Recipe.find();
      res.status(200).json(recipe);
    } catch (err) {
      res.status(404).json({message: err.message});
    }
  },
  getRecipe: async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id)
        .populate("review", {
          reviewer: 1,
          timesMade: 1,
          rating: 1,
          picturePath: 1,
        })
        .populate("comments", {userId: 1, parentId: 1, text: 1});

      res.status(200).json(recipe);
    } catch (err) {
      res.status(404).json({message: err.message});
    }
  },

  getUserRecipes: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },

  getSavedRecipes: async (req, res) => {
    try {
    } catch (err) {
      console.log(err);
    }
  },
};
