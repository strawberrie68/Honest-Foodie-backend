const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
require("express-async-errors");

const recipeRoutes = require("./routes/recipes");
const usersRoutes = require("./routes/users");
const loginRoutes = require("./routes/auth");

/* CONFIGURATIONS */
const middleware = require("./utils/middleware");

mongoose.set("strictQuery", false);

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());

app.use("/api/recipe", recipeRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", loginRoutes);

// app.use(middleware.unknownEndpoint);
// app.use(middleware.errorHandler);

module.exports = app;
