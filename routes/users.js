const express = require("express");
const {userExtractor} = require("../utils/middleware");

const {
  registerUser,
  getUser,
  getUsers,
  getUserFollowers,
  getUserFollowings,
  updateUser,
  addRemoveFollowing,
} = require("../controllers/user");

const router = express.Router();
/* CREATE */
router.post("/", registerUser);

/* READ */
router.get("/", getUsers);
router.get("/:iserId", getUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/followings", getUserFollowings);

/* UPDATE */
router.patch("/:userId", userExtractor, updateUser);
router.patch("/user/:followingId", userExtractor, addRemoveFollowing);

module.exports = router;
