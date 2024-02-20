const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const { initialUsers, recipesInDb, initialRecipes } = require("../test_helper");
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
    .set("Authorization", authHeader)
    .send(recipe)
    .expect(STATUS_CODE.CREATED)
    .expect("Content-Type", /application\/json/);

  recipeId = recipeResponse.body._id;
};

describe("recipe api", () => {
  beforeAll(async () => {
    await setup();
  });

  describe("UPDATE - recipes", () => {
    test("should UPDATE a recipe when given a VALID recipeId", async () => {
      const recipeBefore = await recipesInDb();
      const modifiedRecipe = {
        ...recipeBefore[0],
        title: "This title is a modified recipe title",
      };

      await api
        .patch(`/api/recipe/${recipeId}/edit`)
        .send(modifiedRecipe)
        .expect(STATUS_CODE.OK);
      const recipes = await recipesInDb();
      const titles = recipes.map((recipe) => recipe.title);

      expect(titles).toContain(modifiedRecipe.title);
      expect(recipes).toHaveLength(recipeBefore.length);
    });

    test("should NOT update a recipe when given a INVALID recipeId", async () => {
      const recipeBefore = await recipesInDb();
      const modifiedRecipe = {
        ...recipeBefore[0],
        title: "This title should not be updated",
      };
      const invalidRecipeId = "1234567890";

      await api
        .patch(`/api/recipe/${invalidRecipeId}/edit`)
        .send(modifiedRecipe)
        .expect(STATUS_CODE.NOT_FOUND);
      const recipes = await recipesInDb();
      const titles = recipes.map((recipe) => recipe.title);

      expect(titles).not.toContain(modifiedRecipe.title);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
