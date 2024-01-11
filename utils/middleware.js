const logger = require("./logger");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const STATUS_CODE = require("../shared/errorCode");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(400).json({ error: "token missing or invalid" });
  }

  next(error);
};

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

const tokenExtractor = (request, response, next) => {
  request.token = getTokenFrom(request);
  next();
};

const userExtractor = async (request, response, next) => {
  const token = getTokenFrom(request);

  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }

    request.user = await User.findById(decodedToken.id);
  }

  next();
};

const verifyToken = async (request, response, next) => {
  try {
    let token = request.header("Authorization");

    if (!token) {
      return response.status(STATUS_CODE.FORBIDDEN).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err)
        return response.status(STATUS_CODE.BAD_REQUEST).send("Invalid Token");
    });
    request.user = verified;
    next();
  } catch (err) {
    response
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  verifyToken,
};
