const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const {
  initialRecipes,
  initialUsers,
  recipesInDb,
  usersInDb,
} = require("./test_helper");

const api = supertest(app);
const Recipe = require("../models/Recipe");
const User = require("../models/User");

let authHeader;
describe("recipes api", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    // create a test user and save the corresponding auth header
    const user = initialUsers[0];
    await api.post("/api/users").send(user);
    const response = await api.post("/api/auth/login").send(user);

    authHeader = `Bearer ${response.body.token}`;
  });

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await Recipe.insertMany(initialRecipes);
  });

  describe("BASIC FETCH - when there is initially some recipe saved", () => {
    test("recipe are returned as json", async () => {
      await api
        .get("/api/recipe")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all recipes are returned", async () => {
      const response = await api.get("/api/recipe");

      expect(response.body).toHaveLength(initialRecipes.length);
    });

    test("a specific recipe is within the returned recipe", async () => {
      const response = await api.get("/api/recipe");

      const titles = response.body.map((r) => r.title);

      expect(titles).toContain("strawberry shortcake");
    });

    test("able to return user's recipe using userId", async () => {
      const user = await usersInDb();
      const userID = user.map((r) => r.id);
      const recipe = initialRecipes[0];

      await api.post("/api/recipe/add").send(recipe);
      const newResponse = await api.get(`/api/recipe/${userID}/recipes`);

      expect(newResponse.title).toContain("strawberry shortcake");
    });

    test("able to get a specfic recipe using recipeId", async () => {
      const recipes = await recipesInDb();
      const recipeId = recipes[0]._id.toString();

      const response = await api.get(`/api/recipe/${recipeId}`);

      expect(response.body.title).toContain("strawberry shortcake");
    });

    describe("a new recipe", () => {
      test("can be added", async () => {
        const recipe = initialRecipes[0];

        await api
          .post("/api/recipe/add")
          .set("Authorization", authHeader)
          .send(recipe)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        const recipes = await recipesInDb();

        expect(recipes).toHaveLength(initialRecipes.length + 1);

        const titles = recipes.map((r) => r.title);

        expect(titles).toContain(recipe.title);
      });

      test("can not be added when theres missing info", async () => {
        const recipe = {
          title:
            "strawberry shortcake new version - check if recipe can be added",
        };

        await api
          .post("/api/recipe/add")
          .set("Authorization", authHeader)
          .send(recipe)
          .expect(400);

        const recipes = await recipesInDb();
        expect(recipes).toHaveLength(initialRecipes.length);
      });
    });

    describe("a new review", () => {
      test("can be added", async () => {
        const response = await api.get("/api/recipe");
        const ids = response.body.map((r) => r._id);

        const review = {
          timesMade: 2,
          rating: 5,
          picturePath: "thisIsPicture",
        };

        await api
          .post(`/api/recipe/${ids[0]}`)
          .set("Authorization", authHeader)
          .send(review)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        const recipes = await recipesInDb();

        expect(recipes[0].review).toHaveLength(
          initialRecipes[0].review.length + 1
        );
      });
    });

    describe("a new comment", () => {
      test("can be added", async () => {
        const response = await api.get("/api/recipe");
        const recipeId = response.body[0]._id;

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
        const response = await api.get("/api/recipe");
        const recipeId = response.body[0]._id;

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

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
