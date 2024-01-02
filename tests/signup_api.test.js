const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const {initialUsers, usersInDb} = require("./test_helper");

const api = supertest(app);
const User = require("../models/User");

describe("creation of a user", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("succeeds with valid username and password", async () => {
    const user = {
      username: "testuser04",
      firstName: "mickey",
      lastName: "Michelle",
      password: "Wong",
      email: "email.com",
    };

    const response = await api
      .post("/api/users")
      .send(user)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const users = await usersInDb();

    expect(users).toHaveLength(1);
    const usernames = users.map((u) => u.username);
    expect(usernames).toContain(user.username);
  });

  test("fails with a proper error if username is too short", async () => {
    const user = {
      username: "ml",
      password: "secret",
      firstNane: "janet",
      lastName: "jam",
      email: "this@gmail.com",
    };

    const response = await api
      .post("/api/users")
      .send(user)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toContain(
      "`username` (`ml`) is shorter than the minimum allowed length (3)"
    );
  });

  test("fails with a proper error if username not unique", async () => {
    const firstUser = initialUsers[0];
    await api.post("/api/users").send(firstUser);

    const duplicateUser = initialUsers[0];

    const response = await api
      .post("/api/users")
      .send(duplicateUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toContain("expected `username` to be unique.");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
