const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  login: async (request, response) => {
    try {
      const { username, password } = request.body;
      const user = await User.findOne({ username });
      console.log(user);
      if (!user)
        return response.status(400).json({ error: "User does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return response.status(400).json({ error: "Invalid credentials." });

      const userToken = {
        username: user.username,
        id: user._id,
      };

      const token = jwt.sign(userToken, process.env.SECRET);
      delete user.password;
      response
        .status(200)
        .json({ token, username: user.username, name: user.firstName, user });
    } catch (err) {
      response.status(500).json({ error: err.message });
    }
    // try {
    //   const { username, password } = request.body;

    //   const user = await User.findOne({ username });
    //   if (!user) {
    //     return response.status(401).json({
    //       error: "invalid username or password",
    //     });
    //   }

    //   const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
    //   if (!passwordCorrect) {
    //     return response.status(401).json({
    //       error: "invalid username or password",
    //     });
    //   }

    //   const userToken = {
    //     username: user.username,
    //     id: user._id,
    //   };

    //   const token = jwt.sign(userToken, process.env.SECRET);

    //   response
    //     .status(200)
    //     .send({ token, username: user.username, name: user.name });
    // } catch (err) {
    //   response.status(500).json({ error: err.message });
    // }
  },
};
