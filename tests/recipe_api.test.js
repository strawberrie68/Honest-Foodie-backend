const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const {
  initialRecipes,
  initialUsers,
  recipesInDb,
  recipeToAdd,
} = require("./test_helper");

const api = supertest(app);
const Recipe = require("../models/Recipe");
const User = require("../models/User");

let authHeader;
let userId;
let recipeId;

describe("2.recipe api", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    // create a test user and save the corresponding auth header
    const user = initialUsers[0];
    await api.post("/api/users").send(user);
    const response = await api.post("/api/auth/login").send(user);
    userId = response.body.id;
    authHeader = `Bearer ${response.body.token}`;
  });

  describe("add new recipe", () => {
    test("can be added", async () => {
      await Recipe.deleteMany({});
      const recipe = recipeToAdd;
      const beforeRecipes = await recipesInDb();

      const response = await api
        .post("/api/recipe/create")
        .set("Authorization", authHeader)
        .send(recipe)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      recipeId = response.body._id;

      const afterRecipes = await recipesInDb();

      expect(afterRecipes).toHaveLength(beforeRecipes.length + 1);
    });

    test("can be updated", async () => {
      const recipeBefore = await recipesInDb();

      const modifiedRecipe = {
        ...recipeBefore[0],
        title: "Modified Recipe Title",
      };

      await api
        .patch(`/api/recipe/${recipeId}/edit`)
        .send(modifiedRecipe)
        .expect(200);

      const recipes = await recipesInDb();
      const titles = recipes[0].title;
      expect(titles).toContain(modifiedRecipe.title);
    });

    describe("recipe can be", () => {
      beforeEach(async () => {
        const recipe = initialRecipes[0];

        const response = await api
          .post("/api/recipe/create")
          .set("Authorization", authHeader)
          .send(recipe);

        recipeId = response.body._id;
      });

      test("deleted by the creator", async () => {
        const recipeBefore = await recipesInDb();

        await api
          .delete(`/api/recipe/${recipeId}/delete`)
          .set("Authorization", authHeader)
          .expect(204);
        const recipesAfter = await recipesInDb();

        expect(recipesAfter).toHaveLength(recipeBefore.length - 1);
      });

      test("can not be deleted without valid auth header", async () => {
        const recipeBefore = await recipesInDb();

        await api.delete(`/api/recipe/${recipeId}/delete`).expect(401);

        const recipesAfter = await recipesInDb();

        expect(recipesAfter).toHaveLength(recipeBefore.length);
      });

      test("able to return user's recipe using userId", async () => {
        const newResponse = await api.get(`/api/recipe/${userId}/recipes`);

        expect(newResponse.body.recipes[0].title).toContain(
          "strawberry shortcake"
        );
      });

      test("able to return recipe using recipeId", async () => {
        await api
          .get(`/api/recipe/${recipeId}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
      });
    });
    describe("a new review", () => {
      test("can be added", async () => {
        const beforeAddingReview = await api.get(`/api/recipe/${recipeId}`);

        const review = {
          timesMade: 2,
          rating: 5,
          picturePath: "thisIsPicture",
        };

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(review)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        const afterAddingReview = await api.get(`/api/recipe/${recipeId}`);

        expect(afterAddingReview.body.review).toHaveLength(
          beforeAddingReview.body.review.length + 1
        );
      });

      test("is added to user's review", async () => {
        const beforeAddingReview = await api.get(`/api/users/${userId}`);

        const review = {
          timesMade: 2,
          rating: 5,
          picturePath: "thisIsPicture",
        };

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(review)
          .expect(201)
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
          .expect(201)
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
        const comment = {
          parentId: null,
        };

        await api
          .post(`/api/recipe/${recipeId}/comment`)
          .set("Authorization", authHeader)
          .send(comment)
          .expect(400)
          .expect("Content-Type", /application\/json/);
      });
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
