const RECIPE_API = "/api/recipe";
const USER_API = "/api/users";
const AUTH_API = "/api/auth/login";
const ADD_RECIPE_API = "/api/recipe/add";
const STATUS_CODE = require("../shared/errorCode");

const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

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

const getProperty = async (endpoint, id, property) => {
  const response = await api.get(`/${endpoint}/${id}`);
  return response.body[property];
};

const addToRecipe = async (recipeId, item, itemToAdd, token) => {
  await api
    .post(`${RECIPE_API}/${recipeId}/${item}`)
    .set("Authorization", `Bearer ${token}`)
    .send(itemToAdd)
    .expect(STATUS_CODE.CREATED)
    .expect("Content-Type", /application\/json/);
};

module.exports = {
  createUserAndLogin,
  addRecipe,
  addToRecipe,
  updateRecipe,
  getProperty,
};
