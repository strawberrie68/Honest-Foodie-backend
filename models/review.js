const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timesMade: { type: Number, default: 1 },
  rating: Number,
  picturePath: String,
  userReview: String,
  isRecommended: Boolean,
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
