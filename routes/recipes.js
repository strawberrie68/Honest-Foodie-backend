const express = require("express");
const {userExtractor} = require("../utils/middleware");

const {
  getFeedRecipes,
  getUserRecipes,
  getRecipe,
  getSavedRecipe,
  addToSaveRecipe,
  createRecipe,
  createReview,
  createComment,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipes");

const router = express.Router();

/* READ */
router.get("/", getFeedRecipes);
router.get("/:id", getRecipe);
router.get("/:userId/recipes", getUserRecipes);

/* POST */
router.post("/add", userExtractor, createRecipe);
router.post("/:id", userExtractor, createReview);
router.post("/:id/comment", userExtractor, createComment);

// /* UPDATE */
router.patch("/:id/save", userExtractor, addToSaveRecipe);
// router.patch("/edit/:id", updateRecipe);

// /* DELETE */
router.delete("/delete/:id", userExtractor, deleteRecipe);

module.exports = router;
