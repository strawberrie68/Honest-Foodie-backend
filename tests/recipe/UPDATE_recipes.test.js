const supertest = require("supertest");
const app = require("../../app");
const Recipe = require("../../models/recipe");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");

const {initialUsers, recipesInDb, initialRecipes} = require("../test_helper");
const STATUS_CODE = require("../../shared/errorCode");

// User related variables
let authHeader;
let userId;
let token;

// Recipe related variables
let recipeId;

const RECIPE_API = "/api/recipe";
const USER_API = "/api/users";
const AUTH_API = "/api/auth/login";
const ADD_RECIPE_API = "/api/recipe/add";

const setup = async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  const newUser = initialUsers[1];
  const recipe = initialRecipes[0];

  let response = await createUserAndLogin(newUser);
  token = response.body.token;
  authHeader = `Bearer ${token}`;
  userId = response.body.id;

  const recipeResponse = await addRecipe(recipe, authHeader);
  recipeId = recipeResponse.body._id;
};

const createUserAndLogin = async (user) => {
  await api.post(USER_API).send(user);
  return api.post(AUTH_API).send(user).expect(STATUS_CODE.OK);
};

const addRecipe = async (recipe, authHeader) => {
  return api
    .post(ADD_RECIPE_API)
    .set("Authorization", authHeader)
    .send(recipe)
    .expect(STATUS_CODE.CREATED)
    .expect("Content-Type", /application\/json/);
};

const updateRecipe = (recipeId, recipe, token) => {
  return api
    .patch(`${RECIPE_API}/${recipeId}/edit`)
    .set("Authorization", `Bearer ${token}`)
    .send(recipe);
};

const getRecipesAndTitles = async () => {
  const recipes = await recipesInDb();
  const recipeTitles = recipes.map((recipe) => recipe.title);
  return {recipes, recipeTitles};
};

describe("recipe api", () => {
  beforeAll(async () => {
    await setup();
  });

  describe("UPDATE - recipes", () => {
    test("should UPDATE a recipe when given a VALID recipeId", async () => {
      let {recipes, recipeTitles} = await getRecipesAndTitles();
      expect(recipes).toHaveLength(1);

      const modifiedRecipe = {
        ...recipes[0],
        title: "This title is a modified recipe title",
      };

      await updateRecipe(recipeId, modifiedRecipe, token).expect(
        STATUS_CODE.OK
      );
      ({recipes, recipeTitles} = await getRecipesAndTitles());

      expect(recipeTitles).toContain(modifiedRecipe.title);
      expect(recipes).toHaveLength(1);
    });

    test("should NOT update a recipe when given a INVALID recipeId", async () => {
      let {recipes, recipeTitles} = await getRecipesAndTitles();
      expect(recipes).toHaveLength(1);

      const invalidRecipeId = "1234567890";
      const modifiedRecipe = {
        ...recipes[0],
        title: "This title should not be updated",
      };

      await updateRecipe(invalidRecipeId, modifiedRecipe, token).expect(
        STATUS_CODE.NOT_FOUND
      );
      ({recipes, recipeTitles} = await getRecipesAndTitles());

      expect(recipeTitles).not.toContain(modifiedRecipe.title);
      expect(recipes).toHaveLength(1);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
