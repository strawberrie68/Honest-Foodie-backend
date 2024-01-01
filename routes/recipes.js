const express = require("express");
const { verifyToken } = require("../utils/middleware");

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
router.post("/add", verifyToken, createRecipe);
router.post("/:recipeId", verifyToken, createReview);
router.post("/:id/comment", verifyToken, createComment);

// /* UPDATE */
router.patch("/:id/save", verifyToken, addToSaveRecipe);
// router.patch("/edit/:id", updateRecipe);

// /* DELETE */
router.delete("/delete/:id", verifyToken, deleteRecipe);

module.exports = router;
