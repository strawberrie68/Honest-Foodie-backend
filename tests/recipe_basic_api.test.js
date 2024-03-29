const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const { initialRecipes, initialUsers } = require("./test_helper");

const api = supertest(app);
const Recipe = require("../models/recipe");
const User = require("../models/user");
const Comment = require("../models/comment");
const Review = require("../models/review");
const STATUS_CODE = require("../shared/errorCode");

let authHeader;
let userId;

describe("recipes api", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Review.deleteMany({});

    // create a test user and save the corresponding auth header
    const user = initialUsers[1];
    await api.post("/api/users").send(user);
    const response = await api.post("/api/auth/login").send(user);

    userId = response.body.id;
    authHeader = `Bearer ${response.body.token}`;
  });

  describe("BASIC FETCH - when there is initially some recipe saved", () => {
    beforeEach(async () => {
      await Recipe.deleteMany({});
      await Recipe.insertMany(initialRecipes);
    });
    test("recipe are returned as json", async () => {
      await api
        .get("/api/recipe")
        .expect(STATUS_CODE.OK)
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
