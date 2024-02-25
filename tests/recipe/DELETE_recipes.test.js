const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialRecipes, initialUsers, recipesInDb } = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

const { createUserAndLogin, addRecipe } = require("../api_test_helpers.js");

const RECIPE_API = "/api/recipe";
const DELETE = "/delete";

const setupTest = async () => {
  const newUser = initialUsers[1];
  const recipe = initialRecipes[0];

  const response = await createUserAndLogin(newUser);
  const token = response.body.token;
  const authHeader = `Bearer ${token}`;
  const recipeResponse = await addRecipe(recipe, authHeader);
  const recipeId = recipeResponse.body._id;

  return { token, recipeId };
};

describe("recipe api", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
  });

  test("should not delete a recipe when the authorization header is invalid", async () => {
    const { recipeId } = await setupTest();
    let recipes = await recipesInDb();
    expect(recipes).toHaveLength(1);

    await api
      .delete(`${RECIPE_API}/${recipeId}${DELETE}`)
      .expect(STATUS_CODE.NOT_AUTHORIZED);
    recipes = await recipesInDb();

    expect(recipes).toHaveLength(1);
    expect(recipes[0]._id.toString()).toContain(recipeId);
  });

  test("should delete a recipe if the user is the creator", async () => {
    const { token, recipeId } = await setupTest();
    let recipes = await recipesInDb();
    expect(recipes).toHaveLength(1);

    await api
      .delete(`${RECIPE_API}/${recipeId}${DELETE}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(STATUS_CODE.NO_CONTENT);
    recipes = await recipesInDb();

    expect(recipes).not.toContain(recipeId);
    expect(recipes).toHaveLength(0);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
