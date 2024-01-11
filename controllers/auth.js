const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const STATUS_CODE = require("../shared/errorCode");

module.exports = {
  login: async (request, response) => {
    const { username, password } = request.body;

    const user = await User.findOne({ username: username });
    if (!user)
      return response.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return response.status(400).json({ msg: "Invalid credentials. " });

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    response.status(STATUS_CODE.OK).send({
      token,
      username: user.username,
      name: user.name,
      id: user._id,
      user,
    });
  },
};
