const express = require("express");
const { userExtractor } = require("../utils/middleware");

const {
  registerUser,
  getUser,
  getUserFollowers,
  getUserFollowings,
  updateUser,
  addRemoveFollowing,
} = require("../controllers/user");

const router = express.Router();
/* CREATE */
router.post("/", registerUser);

/* READ */
router.get("/:userId", getUser);
router.get("/:id/followers", getUserFollowers);
router.get("/:id/followings", getUserFollowings);

/* UPDATE */
router.patch("/:id", userExtractor, updateUser);
router.patch("/user/:followingId", userExtractor, addRemoveFollowing);

module.exports = router;
