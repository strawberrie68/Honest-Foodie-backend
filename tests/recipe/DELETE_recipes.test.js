const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const {initialRecipes, initialUsers, recipesInDb} = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

const {createUserAndLogin, addRecipe} = require("../api_test_helper");

let authHeader;
let userId;
let recipeId;
let token;

const RECIPE_API = "api/recipe";

const setup = async () => {
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
};

describe("recipe api", () => {
  beforeAll(async () => {
    await setup();
  });

  test("should not delete a recipe when the authorization header is invalid", async () => {
    let recipes = await recipesInDb();
    expect(recipes).toHaveLength(1);

    await api
      .delete(`/${RECIPE_API}/${recipeId}/delete`)
      .expect(STATUS_CODE.NOT_AUTHORIZED);
    recipes = await recipesInDb();

    expect(recipes).toHaveLength(1);
    expect(recipes[0]._id.toString()).toContain(recipeId);
  });

  test("should delete a recipe if the user is the creator", async () => {
    let recipes = await recipesInDb();
    expect(recipes).toHaveLength(1);

    await api
      .delete(`/${RECIPE_API}/${recipeId}/delete`)
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
