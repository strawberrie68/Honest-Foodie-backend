const Recipe = require("../models/recipe");
const User = require("../models/user");

// mock data
// mock recipe

const testRecipe = {
  title: "strawberry shortcake",
  picturePath:
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.ricardocuisine.com%2Fservices%2Frecipes%2F9640.jpg&tbnid=eFe18pfPtTruUM&vet=12ahUKEwjbw9ybiO2BAxWSBzQIHd8WAyoQMygOegUIARCWAQ..i&imgrefurl=https%3A%2F%2Fwww.ricardocuisine.com%2Fen%2Frecipes%2F9640-japanese-strawberry-shortcake&docid=K_d7KXa2YhtFcM&w=1920&h=2592&q=strawberry%20shortcake%20japanese&ved=2ahUKEwjbw9ybiO2BAxWSBzQIHd8WAyoQMygOegUIARCWAQ",
  servings: "6",
  steps: [
    {
      stepName: "Cake",
      step: [
        "In a large bowl, whisk the egg whites with an electric mixer until soft peaks form. Gradually whisk in the sugar until semi-stiff peaks form.",
        "In another bowl, whisk the egg yolks with the oil and milk. Add the flour. Add one-quarter of the meringue mixture and stir to combine. Using a spatula, gently fold in the remaining meringue. Spread the batter out in the two prepared cake pans.",
        "Bake for 20 minutes or until a toothpick inserted in the centre of a cake comes out clean. Remove from the oven and immediately turn the cake pans over on a wire rack to cool completely, about 2 hours. Run a thin blade between the side of the pans and the cakes to unmold.",
      ],
    },
    {
      stepName: "Whipped Cream",
      step: [
        "In a bowl, whisk the cream and ¼ cup (60 ml) of the condensed milk with an electric mixer until stiff peaks form. Transfer ½ cup (125 ml) of the whipped cream into a pastry bag fitted with a plain tip. Set aside until ready to decorate the cake.",
      ],
    },
    {
      stepName: "Assembly",
      step: [
        "Place one cake on a serving dish. Using a pastry brush, cover the top of the cake with the remaining condensed milk. Spread ¾ cup (180 ml) of the whipped cream over the top of the cake. Top with the diced strawberries. Cover with the second cake. Using a spatula, spread ¾ cup (180 ml) of the whipped cream in a thin layer around the sides of the cake. Spread the remaining whipped cream over the top of the cake. Using the pastry bag, pipe dollops of the reserved whipped cream around the top edge of the cake. Decorate with the fresh strawberries. The strawberry shortcake will keep covered in the refrigerator for 2 days.",
      ],
    },
  ],
  ingredients: [
    {
      section: "cake",
      items: [
        {
          name: "eggs",
          unit: "none",
          amount: 3,
        },
        {
          name: "milk",
          unit: "cup",
          amount: 1,
        },
        {
          name: "sugar",
          unit: "cup",
          amount: 0.5,
        },
      ],
    },
    {
      section: "Whipping Cream",
      items: [
        {
          name: "33% Whipping Cream",
          unit: "cup",
          amount: 2,
        },
        {
          name: "Icing sugar",
          unit: "cup",
          amount: 0.5,
        },
        {
          name: "Condensed Milk",
          unit: "cup",
          amount: 0.5,
        },
      ],
    },
  ],
  time: {hours: "1", minutes: "30"},
  tags: ["cake", "strawberry"],
};

const initialRecipes = [testRecipe, testRecipe, testRecipe];

const recipeToAdd = {
  ...testRecipe,
  title: "strawberry shortcake ver 5",
  picturePath:
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.ricardocuisine.com%2Fservices%2Frecipes%2F9640.jpg&tbnid=eFe18pfPtTruUM&vet=12ahUKEwjbw9ybiO2BAxWSBzQIHd8WAyoQMygOegUIARCWAQ..i&imgrefurl=https%3A%2F%2Fwww.ricardocuisine.com%2Fen%2Frecipes%2F9640-japanese-strawberry-shortcake&docid=K_d7KXa2YhtFcM&w=1920&h=2592&q=strawberry%20shortcake%20japanese&ved=2ahUKEwjbw9ybiO2BAxWSBzQIHd8WAyoQMygOegUIARCWAQ",
};

//mock user

const initialUsers = [
  {
    username: "mickeyxx",
    firstName: "mickey",
    lastName: "Michelle",
    password: "12345678",
    email: "email.com",
  },
  {
    username: "testuser02",
    firstName: "mickey",
    lastName: "times",
    password: "123457",
    email: "email.com",
  },
];

//mock review

const recipeReview = {
  timesMade: 2,
  rating: 5,
  picturePath: "thisIsPicture",
  isRecommend: true,
  userReview: "this is my review",
};

//helper functions

const nonExistingId = async () => {
  const recipe = new Recipe({
    ...testRecipe,
    userId: "498573895",
    isRecommended: {},
    comments: [],
    review: [],
  });

  await recipe.save();
  await recipe.remove();

  return recipe._id.toString();
};

const recipesInDb = async () => {
  const recipes = await Recipe.find({});
  return recipes ? recipes?.map((recipe) => recipe.toJSON()) : {};
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  recipeToAdd,
  initialRecipes,
  initialUsers,
  recipeReview,
  nonExistingId,
  recipesInDb,
  usersInDb,
};
