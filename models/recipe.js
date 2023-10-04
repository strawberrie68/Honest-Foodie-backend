const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    picturePath: {
      type: String,
      default: "",
    },
    servings: Number,
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
      type: String,
      required: true,
    },
    isRecommended: {type: Map, of: Boolean},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comments"}],
    review: [{type: mongoose.Schema.Types.ObjectId, ref: "Review"}],
    tags: {type: Array, default: []},
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
