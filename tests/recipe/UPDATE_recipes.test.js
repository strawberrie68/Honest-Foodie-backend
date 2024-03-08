const supertest = require("supertest");
const mongoose = require("mongoose");

const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const { initialUsers, recipesInDb, initialRecipes } = require("../test_helper");
const {
  createUserAndLogin,
  addRecipe,
  updateRecipe,
} = require("../api_test_helpers");

const api = supertest(app);
const STATUS_CODE = require("../../shared/errorCode");
const INVALID_RECIPE_ID = "1234567890";

const setupTest = async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  const newUser = initialUsers[1];
  const recipe = initialRecipes[0];

  const response = await createUserAndLogin(newUser);
  const token = response.body.token;
  const authHeader = `Bearer ${token}`;
  const userId = response.body.id;

  const recipeResponse = await addRecipe(recipe, authHeader);
  const recipeId = recipeResponse.body._id;
  return { token, authHeader, userId, recipeId };
};

const getRecipes = async () => {
  const recipes = await recipesInDb();
  return { recipes };
};
const getRecipeTitles = async () => {
  const recipes = await recipesInDb();
  const recipeTitles = recipes.map((recipe) => recipe.title);
  return { recipeTitles };
};

describe("recipe api", () => {
  describe("UPDATE - recipes", () => {
    test("should UPDATE a recipe when given a VALID recipeId", async () => {
      const { token, recipeId } = await setupTest();
      let { recipes } = await getRecipes();
      let { recipeTitles } = await getRecipeTitles();
      expect(recipes).toHaveLength(1);

      const modifiedRecipe = {
        ...recipes[0],
        title: "This title is a modified recipe title",
      };

      await updateRecipe(recipeId, modifiedRecipe, token).expect(
        STATUS_CODE.OK
      );
      ({ recipes } = await getRecipes()),
        ({ recipeTitles } = await getRecipeTitles());

      expect(recipeTitles).toContain("This title is a modified recipe title");
      expect(recipes).toHaveLength(1);
    });

    test("should NOT update a recipe when given a INVALID recipeId", async () => {
      const { token } = await setupTest();
      let { recipes } = await getRecipes();
      let { recipeTitles } = await getRecipeTitles();
      expect(recipes).toHaveLength(1);

      const modifiedRecipe = {
        ...recipes[0],
        title: "This title should not be updated",
      };

      await updateRecipe(INVALID_RECIPE_ID, modifiedRecipe, token).expect(
        STATUS_CODE.NOT_FOUND
      );
      ({ recipes } = await getRecipes()),
        ({ recipeTitles } = await getRecipeTitles());

      expect(recipeTitles).not.toContain("This title should not be updated");
      expect(recipes).toHaveLength(1);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
