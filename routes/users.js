const express = require("express");
const {
  registerUser,
  getUser,
  getUserFollowers,
  getUserFollowings,
  updateUser,
  deleteUserFollowings,
} = require("../controllers/user");

const router = express.Router();
/* CREATE */
router.post("/", registerUser);

/* READ */
router.get("/id", getUser);
router.get("/:id/followers", getUserFollowers);
router.get("/:id/followings", getUserFollowings);

/* UPDATE */
router.patch("/:id", updateUser);

/* DELETE */
router.patch("/:id/:friendId", deleteUserFollowings);

module.exports = router;
