const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const STATUS_CODE = require("../shared/errorCode");

module.exports = {
  login: async (request, response) => {
    const {username, password} = request.body;

    const user = await User.findOne({username});
    const passwordCorrect = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!(user && passwordCorrect)) {
      return res.status(STATUS_CODE.NOT_AUTHORIZED).json({
        error: "invalid username or password",
      });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    response
      .status(STATUS_CODE.OK)
      .send({token, username: user.username, name: user.name, id: user._id});
  },
};