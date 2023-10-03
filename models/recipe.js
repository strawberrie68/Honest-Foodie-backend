const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    picturePath: {
      type: String,
      required: true,
    },
    servings: {type: Number},
    steps: [{type: String, required: true}],
    ingredients: [
      {
        ingredient: {type: String, required: true},
        unit: {type: Number, required: true},
        amount: {type: Number, required: true},
      },
    ],
    time: {hours: {type: Number}, minutes: {type: Number}},
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRecommended: {},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comments"}],
    review: [{type: mongoose.Schema.Types.ObjectId, ref: "Review"}],
    tags: [{type: string}],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recipe", schema);
