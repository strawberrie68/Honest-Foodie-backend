const express = require("express");
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
// router.get("/:userId/recipes/review", getSavedRecipe);

/* POST */
router.post("/add", createRecipe);
router.post("/:id", createReview);
router.post("/:id/comment", createComment);

// /* UPDATE */
// router.patch('/recipe/save/:id', addToSaveRecipe)
// router.patch("/recipe/edit/:id", updateRecipe);

// /* DELETE */
// router.delete("/recipe/:id", deleteRecipe);

module.exports = router;
