// External libraries
const supertest = require("supertest");
const mongoose = require("mongoose");

// Internal modules
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const { initialUsers, recipesInDb, initialRecipes } = require("../test_helper");
const {
  createUserAndLogin,
  addRecipe,
  updateRecipe,
} = require("../api_test_helpers");

// Constants
const api = supertest(app);
const STATUS_CODE = require("../../shared/errorCode");
const INVALID_RECIPE_ID = "1234567890";
const MODIFIED_TITLE = "This title is a modified recipe title";
const UNMODIFIED_TITLE = "This title should not be updated";

const getRecipesAndTitles = async () => {
  const recipes = await recipesInDb();
  const recipeTitles = recipes.map((recipe) => recipe.title);
  return { recipes, recipeTitles };
};

describe("recipe api", () => {
  let authHeader, token, recipeId, userId;
  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    const newUser = initialUsers[1];
    const recipe = initialRecipes[0];

    let response = await createUserAndLogin(newUser);
    token = response.body.token;
    authHeader = `Bearer ${token}`;
    userId = response.body.id;

    const recipeResponse = await addRecipe(recipe, authHeader);
    recipeId = recipeResponse.body._id;
  });

  describe("UPDATE - recipes", () => {
    test("should UPDATE a recipe when given a VALID recipeId", async () => {
      let { recipes, recipeTitles } = await getRecipesAndTitles();
      expect(recipes).toHaveLength(1);

      const modifiedRecipe = {
        ...recipes[0],
        title: MODIFIED_TITLE,
      };

      await updateRecipe(recipeId, modifiedRecipe, token).expect(
        STATUS_CODE.OK
      );
      ({ recipes, recipeTitles } = await getRecipesAndTitles());

      expect(recipeTitles).toContain(MODIFIED_TITLE);
      expect(recipes).toHaveLength(1);
    });

    test("should NOT update a recipe when given a INVALID recipeId", async () => {
      let { recipes, recipeTitles } = await getRecipesAndTitles();
      expect(recipes).toHaveLength(1);

      const modifiedRecipe = {
        ...recipes[0],
        title: UNMODIFIED_TITLE,
      };

      await updateRecipe(INVALID_RECIPE_ID, modifiedRecipe, token).expect(
        STATUS_CODE.NOT_FOUND
      );
      ({ recipes, recipeTitles } = await getRecipesAndTitles());

      expect(recipeTitles).not.toContain(UNMODIFIED_TITLE);
      expect(recipes).toHaveLength(1);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
