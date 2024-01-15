const supertest = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const api = supertest(app);
const mongoose = require("mongoose");
const {initialUsers} = require("../test_helper");

const USER_API = "/api/users";
const AUTH_API = "/api/auth/login";

const registerUser = async (user) => {
  const response = await api.post(USER_API).send(user).expect(201);
  expect(response.body.username).toBe(user.username);
  return response;
};

const loginUser = async (credentials) => {
  const response = await api.post(AUTH_API).send(credentials).expect(200);
  expect(response.body.token).toBeDefined();
  return response.body.token;
};

describe("User Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  const newUser = initialUsers[0];

  test("should register, login and set authorization header", async () => {
    // Register
    await registerUser(newUser);

    // Login
    const loginCredentials = {
      username: newUser.username,
      password: newUser.password,
    };

    const token = await loginUser(loginCredentials);

    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
