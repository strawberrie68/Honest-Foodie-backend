const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const {initialRecipes, initialUsers} = require("./test_helper");

const api = supertest(app);
const Recipe = require("../models/recipe");
const User = require("../models/user");
const Comment = require("../models/comment");
const Review = require("../models/review");
const STATUS_CODE = require("../shared/errorCode");

const RECIPE_API = "/api/recipe";
const AUTH_API = "/api/auth/login";
const USER_API = "/api/users";

let authHeader;
let userId;

const registerUser = async (user) => {
  await api.post(USER_API).send(user);
  const response = await api.post(AUTH_API).send(user);
  userId = response.body.id;
  authHeader = `Bearer ${response.body.token}`;
};

describe("recipes api", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Review.deleteMany({});
    await registerUser(initialUsers[1]);
  });

  describe("BASIC FETCH - when there is initially some recipe saved", () => {
    beforeEach(async () => {
      await Recipe.deleteMany({});
      await Recipe.insertMany(initialRecipes);
    });

    test("recipe are returned as json", async () => {
      await api
        .get(RECIPE_API)
        .expect(STATUS_CODE.OK)
        .expect("Content-Type", /application\/json/);
    });

    test("all recipes are returned", async () => {
      const response = await api.get(RECIPE_API);
      expect(response.body).toHaveLength(initialRecipes.length);
    });

    test("a specific recipe is within the returned recipe", async () => {
      const response = await api.get(RECIPE_API);
      const recipeTitles = response.body.map((recipe) => recipe.title);
      expect(recipeTitles).toContain(initialRecipes[0].title);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
