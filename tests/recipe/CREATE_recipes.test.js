const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const {
  initialUsers,
  recipesInDb,
  recipeToAdd,
  recipeReview,
} = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

let authHeader;
let userId;
let recipeId;
let token;

describe("recipe api", () => {
  beforeEach(async () => {
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
  });

  describe("add new recipe", () => {
    test("can be added", async () => {
      await Recipe.deleteMany({});
      const recipe = recipeToAdd;
      const beforeRecipes = await recipesInDb();

      const response = await api
        .post("/api/recipe/add")
        .set("Authorization", authHeader)
        .send(recipe)
        .expect(STATUS_CODE.CREATED)
        .expect("Content-Type", /application\/json/);

      recipeId = response.body._id;

      const afterRecipes = await recipesInDb();
      expect(afterRecipes).toHaveLength(beforeRecipes.length + 1);
    });

    describe("a new review", () => {
      test("can be added", async () => {
        const beforeAddingReview = await api.get(`/api/recipe/${recipeId}`);

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(recipeReview)
          .expect(STATUS_CODE.CREATED)
          .expect("Content-Type", /application\/json/);

        const afterAddingReview = await api.get(`/api/recipe/${recipeId}`);
        expect(afterAddingReview.body.reviews).toHaveLength(
          beforeAddingReview.body.reviews.length + 1
        );
      });

      test("is added to user's review", async () => {
        const beforeAddingReview = await api.get(`/api/users/${userId}`);

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(recipeReview)
          .expect(STATUS_CODE.CREATED)
          .expect("Content-Type", /application\/json/);

        const afterAddingReview = await api.get(`/api/users/${userId}`);
        expect(afterAddingReview.body.reviews).toHaveLength(
          beforeAddingReview.body.reviews.length + 1
        );
      });
    });

    describe("a new comment", () => {
      test("can be added", async () => {
        const beforeUpdate = await api.get(`/api/recipe/${recipeId}`);

        const comment = {
          text: "hi, my first comment",
          parentId: null,
        };

        await api
          .post(`/api/recipe/${recipeId}/comment`)
          .set("Authorization", authHeader)
          .send(comment)
          .expect(STATUS_CODE.CREATED)
          .expect("Content-Type", /application\/json/);

        const updatedRecipe = await api.get(`/api/recipe/${recipeId}`);
        expect(updatedRecipe.body.comments).toHaveLength(
          beforeUpdate.body.comments.length + 1
        );
        expect(updatedRecipe.body.comments[0].text).toContain(
          "hi, my first comment"
        );
      });

      test("can not be added when missing info", async () => {
        const comment = {};

        await api
          .post(`/api/recipe/${recipeId}/comment`)
          .set("Authorization", authHeader)
          .send(comment)
          .expect(STATUS_CODE.BAD_REQUEST)
          .expect("Content-Type", /application\/json/);
      });
    });
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
