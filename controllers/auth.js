const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const STATUS_CODE = require("../shared/errorCode");

// Initialize test user if it doesn't exist
const initializeTestUser = async () => {
  const testUsername = "testuser";
  const testPassword = "testpassword";

  try {
    const existingUser = await User.findOne({ username: testUsername });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const testUser = new User({
        username: testUsername,
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        password: hashedPassword,
        picturePath: "",
        flavorProfile: ["Italian", "Asian", "Mexican"],
        caption: "I am a test user",
      });
      await testUser.save();
      console.log("Test user initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing test user:", error);
  }
};

initializeTestUser();

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
