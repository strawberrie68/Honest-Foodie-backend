const express = require("express");
const { verifyToken, userExtractor } = require("../utils/middleware");

const {
  getFeedRecipes,
  getUserRecipes,
  getRecipe,
  getSavedRecipe,
  toggleSavedRecipe,
  createRecipe,
  createReview,
  createComment,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipes");

const router = express.Router();

/* READ */
router.get("/", getFeedRecipes);
router.get("/:recipeId", getRecipe);
router.get("/:userId/recipes", getUserRecipes);

/* POST */
router.post("/add", userExtractor, createRecipe);
router.post("/:recipeId", userExtractor, createReview);
router.post("/:recipeId/comment", userExtractor, createComment);

/* UPDATE */
router.patch("/:recipeId/save", userExtractor, toggleSavedRecipe);
router.patch("/:recipeId/edit", userExtractor, updateRecipe);

/* DELETE */
router.delete("/:recipeId/delete", userExtractor, deleteRecipe);

module.exports = router;
