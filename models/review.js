const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  recipeId: {
    type: String,
    required: true,
  },
  reviewer: {
    type: String,
    required: true,
  },
  timesMade: Number,
  rating: Number,
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
