const supertest = require("supertest");
const app = require("../../app"); // path to your app.js or server.js or index.js
const User = require("../../models/user"); // path to your User model
const api = supertest(app);

describe("User Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("should register, login and set authorization header", async () => {
    // Register
    const newUser = {
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      password: "testpassword",
    };

    let response = await api
      .post("/api/users") // adjust this if your route is different
      .send(newUser)
      .expect(201);

    expect(response.body.username).toBe(newUser.username);

    // Login
    const loginCredentials = {
      username: newUser.username,
      password: newUser.password,
    };

    response = await api
      .post("/api/auth/login") // adjust this if your route is different
      .send(loginCredentials)
      .expect(200);

    const token = response.body.token;

    // Set Authorization header and make an authenticated request
    response = await api
      .get("/api/recipe") // adjust this to one of your protected routes
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Add assertions to check the response
  });
});
