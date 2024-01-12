const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialRecipes, initialUsers } = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

let authHeader;
let userId;
let recipeId;
let token;
let testRecipe;

const setup = async () => {
  await User.deleteMany({});
  const newUser = initialUsers[1];
  let response = await api.post("/api/users").send(newUser);
  response = await api
    .post("/api/auth/login")
    .send(newUser)
    .expect(STATUS_CODE.OK);

  token = response.body.token;
  authHeader = `Bearer ${token}`;
  userId = response.body.id;
  testRecipe = initialRecipes[0];
};

describe("READ - recipes", () => {
  beforeAll(async () => {
    await setup();
  });

  describe("get all recipes from the database", () => {
    beforeEach(async () => {
      await Recipe.deleteMany({});
      await Recipe.insertMany(initialRecipes);
    });

    test("return all recipes are returned", async () => {
      const response = await api.get("/api/recipe");
      expect(response.body).toHaveLength(initialRecipes.length);
    });
  });

  describe("get recipes - with condition", () => {
    beforeEach(async () => {
      const response = await api
        .post("/api/recipe/add")
        .set("Authorization", authHeader)
        .send(testRecipe);
      recipeId = response.body._id;
    });

    test("All user's recipes - when given a userId", async () => {
      const newResponse = await api.get(`/api/recipe/${userId}/recipes`);

      expect(newResponse.body.recipes[0].title).toContain(testRecipe.title);
    });

    test("One recipe - when given a recipeId", async () => {
      const recipeReturned = await api
        .get(`/api/recipe/${recipeId}`)
        .expect(STATUS_CODE.OK)
        .expect("Content-Type", /application\/json/);

      expect(recipeReturned.body.title).toContain(testRecipe.title);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
