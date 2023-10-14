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
    servings: {type: Number, required: true},
    steps: [
      {
        stepName: {type: String},
        step: [{type: String}],
      },
    ],
    ingredients: [
      {
        ingredientsFor: String,
        allIngredients: [
          {
            ingredient: {type: String, required: true},
            unit: {type: String},
            amount: {type: Number, required: true},
          },
        ],
      },
    ],
    time: {hours: {type: Number}, minutes: {type: Number}},
    userId: {
      type: String,
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

// recipeSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
