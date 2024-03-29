const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    recipeId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    text: {
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

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
