const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialRecipes, initialUsers } = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

// User related variables
let authHeader;
let userId;
let token;

// Recipe related variables
let recipeId;
let testRecipe;

const RECIPE_API = "/api/recipe";

const { createUserAndLogin, addRecipe } = require("../api_test_helper");

const setup = async () => {
  await User.deleteMany({});
  const newUser = initialUsers[1];
  let response = await createUserAndLogin(newUser);

  token = response.body.token;
  authHeader = `Bearer ${token}`;
  userId = response.body.id;
  testRecipe = initialRecipes[0];
};

describe("READ - recipes", () => {
  beforeEach(async () => {
    await setup();
  });

  describe("get all recipes from the database", () => {
    beforeEach(async () => {
      await Recipe.deleteMany({});
      await Recipe.insertMany(initialRecipes);
    });

    test("should return all recipes", async () => {
      const response = await api.get(RECIPE_API);

      expect(response.body).toHaveLength(initialRecipes.length);
    });
  });

  describe("get recipes - with condition", () => {
    beforeEach(async () => {
      response = await addRecipe(testRecipe, authHeader);
      recipeId = response.body._id;
    });

    test("should return all recipes of a user when given a userId", async () => {
      const response = await api.get(`${RECIPE_API}/${userId}/recipes`);

      expect(response.body.recipes[0].title).toContain(testRecipe.title);
      expect(response.body.recipes).toHaveLength(1);
    });

    test("should return a recipe when given a recipeId", async () => {
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
