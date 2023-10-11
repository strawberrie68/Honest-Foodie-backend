const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const Recipe = require("../models/Recipe");
const Comments = require("../models/Comments");
const Review = require("../models/Review");

test("recipes are returned as json", async () => {
  await api
    .get("/api/recipe")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

//create user and save the corresponding auth header

//when recipe are saved
//userid is added +

afterAll(async () => {
  await mongoose.connection.close();
});
