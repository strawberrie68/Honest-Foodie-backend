const express = require("express");
const {userExtractor} = require("../utils/middleware");

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
router.patch("/:userId", userExtractor, updateUser);
router.patch("/user/:userfollowingId", userExtractor, toggleFollowing);

module.exports = router;