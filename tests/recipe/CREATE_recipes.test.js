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

const {
  createUserAndLogin,
  addRecipe,
  addToRecipe,
  getProperty,
} = require("../api_test_helper");

const RECIPE_API = "api/recipe";
const USER_API = "api/users";

let authHeader;
let userId;
let token;

let recipeId;
describe("recipe api", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const newUser = initialUsers[1];
    let response = await createUserAndLogin(newUser);

    token = response.body.token;
    authHeader = `Bearer ${token}`;
    userId = response.body.id;

    const recipeResponse = await addRecipe(recipeToAdd, authHeader);
    recipeId = recipeResponse.body._id;
  });

  describe("add new recipe", () => {
    test("can be added", async () => {
      await Recipe.deleteMany({});
      let recipes = await recipesInDb();
      expect(recipes).toHaveLength(0);

      response = await addRecipe(recipeToAdd, authHeader);
      recipes = await recipesInDb();

      expect(recipes).toHaveLength(1);
      expect(recipes[0].title).toContain(recipeToAdd.title);
    });

    describe("a new review", () => {
      test("can be added to recipe", async () => {
        let reviews = await getProperty(`${RECIPE_API}`, recipeId, "reviews");
        console.log(reviews);
        expect(reviews).toHaveLength(0);

        await addToRecipe(recipeId, "review", recipeReview, token);
        reviews = await getProperty(`${RECIPE_API}`, recipeId, "reviews");

        expect(reviews).toHaveLength(1);
        expect(reviews[0].userReview).toContain(recipeReview.userReview);
      });

      test("is added to user's review", async () => {
        let user = await getProperty(`${USER_API}`, userId, "reviews");
        expect(user).toHaveLength(0);

        await addToRecipe(recipeId, "review", recipeReview, token);
        user = await getProperty(`${USER_API}`, userId, "reviews");

        expect(user).toHaveLength(1);
        expect(user[0].userReview).toContain(recipeReview.userReview);
      });
    });

    describe("a new comment", () => {
      test("can be added to recipe", async () => {
        let comments = await getProperty(`${RECIPE_API}`, recipeId, "comments");
        expect(comments).toHaveLength(0);

        const comment = {
          text: "hi, my first comment",
          parentId: null,
        };

        await addToRecipe(recipeId, "comment", comment, token);
        comments = await getProperty(`${RECIPE_API}`, recipeId, "comments");

        expect(comments).toHaveLength(1);
        expect(comments[0].text).toContain(comment.text);
      });

      test("can not be added when missing info", async () => {
        const comment = {};

        await api
          .post(`/${RECIPE_API}/${recipeId}/comment`)
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
