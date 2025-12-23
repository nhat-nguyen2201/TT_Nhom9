const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getPackages,
} = require("../controllers/users/userController");


router.get("/packages", getPackages); 

router.get("/:id", getUserProfile);

module.exports = router;
