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

const getProperty = async (endpoint, id, property) => {
  const response = await api.get(`/${endpoint}/${id}`);
  return response.body[property];
};

let authHeader;
let userId;
let recipeId;
let token;

describe("recipe api", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const newUser = initialUsers[1];
    await api.post("/api/users").send(newUser);

    let response = await api
      .post("/api/auth/login")
      .send(newUser)
      .expect(STATUS_CODE.OK);

    token = response.body.token;
    authHeader = `Bearer ${token}`;
    userId = response.body.id;

    response = await api
      .post("/api/recipe/add")
      .set("Authorization", authHeader)
      .send(recipeToAdd)
      .expect(STATUS_CODE.CREATED)
      .expect("Content-Type", /application\/json/);

    recipeId = response.body._id;
  });

  describe("add new recipe", () => {
    test("can be added", async () => {
      await Recipe.deleteMany({});
      let recipes = await recipesInDb();
      expect(recipes).toHaveLength(0);

      response = await api
        .post("/api/recipe/add")
        .set("Authorization", authHeader)
        .send(recipeToAdd)
        .expect(STATUS_CODE.CREATED)
        .expect("Content-Type", /application\/json/);

      recipes = await recipesInDb();
      expect(recipes).toHaveLength(1);
    });

    describe("a new review", () => {
      test("can be added", async () => {
        let reviews = await getProperty("api/recipe", recipeId, "reviews");
        expect(reviews).toHaveLength(0);

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(recipeReview)
          .expect(STATUS_CODE.CREATED)
          .expect("Content-Type", /application\/json/);

        reviews = await await getProperty("api/recipe", recipeId, "reviews");
        expect(reviews).toHaveLength(1);
      });

      test("is added to user's review", async () => {
        let user = await getProperty("api/users", userId, "reviews");
        expect(user).toHaveLength(0);

        await api
          .post(`/api/recipe/${recipeId}`)
          .set("Authorization", authHeader)
          .send(recipeReview)
          .expect(STATUS_CODE.CREATED)
          .expect("Content-Type", /application\/json/);

        user = await getProperty("api/users", userId, "reviews");
        expect(user).toHaveLength(1);
      });
    });

    describe("a new comment", () => {
      test("can be added", async () => {
        let comments = await getProperty("api/recipe", recipeId, "comments");
        expect(comments).toHaveLength(0);

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
        comments = await getProperty("api/recipe", recipeId, "comments");

        expect(comments).toHaveLength(1);
        expect(comments[0].text).toContain("hi, my first comment");
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
