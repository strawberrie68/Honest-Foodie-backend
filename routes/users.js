const express = require("express");
const { userExtractor, verifyToken } = require("../utils/middleware");

const {
  registerUser,
  getUser,
  getUsers,
  getUserFollowers,
  getUserFollowings,
  updateUser,
  toggleFollowing,
} = require("../controllers/user");

const router = express.Router();
/* CREATE */
router.post("/", registerUser);

/* READ */
router.get("/", getUsers);
router.get("/:userId", getUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/followings", getUserFollowings);

/* UPDATE */
router.patch("/:userId", verifyToken, updateUser);
router.patch("/user/:userFollowingId", verifyToken, toggleFollowing);

module.exports = router;
