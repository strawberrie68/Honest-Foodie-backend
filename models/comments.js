const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema(
  {
    recipeId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const Comments = mongoose.model("comments", commentsSchema);
module.exports = Comments;
