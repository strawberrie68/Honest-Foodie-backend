const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialRecipes, initialUsers, recipesInDb } = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

let authHeader;
let userId;
let recipeId;
let token;

const setup = async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  const newUser = initialUsers[1];
  const recipe = initialRecipes[0];

  let response = await api.post("/api/users").send(newUser);

  response = await api
    .post("/api/auth/login")
    .send(newUser)
    .expect(STATUS_CODE.OK);

  token = response.body.token;
  authHeader = `Bearer ${token}`;
  userId = response.body.id;

  const recipeResponse = await api
    .post("/api/recipe/add")
    .set("Authorization", `Bearer ${token}`)
    .send(recipe);

  recipeId = recipeResponse.body._id;
};

describe("recipe api", () => {
  beforeAll(async () => {
    await setup();
  });

  test("should not delete a recipe if the auth header is not valid", async () => {
    const recipeBefore = await recipesInDb();

    await api
      .delete(`/api/recipe/${recipeId}/delete`)
      .expect(STATUS_CODE.NOT_AUTHORIZED);
    const recipesAfter = await recipesInDb();
    const recipeIdsAfter = recipesAfter.map((recipe) => recipe._id.toString());

    expect(recipesAfter).toHaveLength(recipeBefore.length);
    expect(recipeIdsAfter).toContain(recipeId);
  });

  test("should delete a recipe if the user is the creator", async () => {
    const recipeBefore = await recipesInDb();

    await api
      .delete(`/api/recipe/${recipeId}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(STATUS_CODE.NO_CONTENT);
    const recipesAfter = await recipesInDb();
    const recipeIdsAfter = recipesAfter.map((recipe) => recipe._id.toString());

    expect(recipeIdsAfter).not.toContain(recipeId);
    expect(recipesAfter).toHaveLength(recipeBefore.length - 1);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
