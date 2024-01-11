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
    servings: { type: Number, required: true },
    steps: [
      {
        stepName: { type: String },
        step: [{ type: String }],
      },
    ],
    ingredients: [
      {
        section: { type: String },
        items: [
          {
            name: { type: String, required: true },
            unit: { type: String, default: "none" },
            amount: { type: Number, required: true },
          },
        ],
      },
    ],

    time: { hours: { type: Number }, minutes: { type: Number } },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRecommended: { type: Map, of: Boolean },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    reviews: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
      default: [],
    },
    tags: { type: Array, default: [] },
    description: { type: String, default: "A great recipe to try." },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
