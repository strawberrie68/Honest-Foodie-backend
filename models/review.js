const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  recipeId: {
    type: String,
    required: true,
  },
  reviewerId: {
    type: String,
    required: true,
  },
  timesMade: { type: Number, default: 1 },
  rating: Number,
  picturePath: String,
  isRecommend: Boolean,
  userReview: String,
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
