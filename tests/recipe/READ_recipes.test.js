const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialRecipes, initialUsers } = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

const RECIPE_API = "/api/recipe";
const RECIPES = "recipes";

const { createUserAndLogin, addRecipe } = require("../api_test_helpers");

const setupTest = async () => {
  await User.deleteMany({});
  const newUser = initialUsers[1];

  let response = await createUserAndLogin(newUser);

  const token = response.body.token;
  const authHeader = `Bearer ${token}`;
  const userId = response.body.id;
  const testRecipe = initialRecipes[0];
  const recipeResponse = await addRecipe(testRecipe, authHeader);
  const recipeId = recipeResponse.body._id;

  return { token, authHeader, userId, recipeId, testRecipe };
};

describe("READ - recipes", () => {
  beforeEach(async () => {
    await Recipe.deleteMany({});
    await Recipe.insertMany(initialRecipes);
  });

  describe("get all recipes from the database", () => {
    test("should return all recipes", async () => {
      await setupTest();
      const response = await api.get(RECIPE_API).expect(STATUS_CODE.OK);

      expect(response.body).toHaveLength(initialRecipes.length + 1);
    });
  });

  describe("get recipes - with condition", () => {
    test("should return all recipes of a user when given a userId", async () => {
      const { userId, testRecipe } = await setupTest();
      const response = await api
        .get(`${RECIPE_API}/${userId}/${RECIPES}`)
        .expect(STATUS_CODE.OK);

      expect(response.body.recipes[0].title).toContain(testRecipe.title);
      expect(response.body.recipes).toHaveLength(1);
    });

    test("should return a recipe when given a recipeId", async () => {
      const { recipeId, testRecipe } = await setupTest();
      const response = await api
        .get(`${RECIPE_API}/${recipeId}`)
        .expect(STATUS_CODE.OK)
        .expect("Content-Type", /application\/json/);

      expect(response.body.title).toContain(testRecipe.title);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
