// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth/loginController");
const { register } = require("../controllers/auth/registerController");
const {
  forgotPassword,
} = require("../controllers/auth/forgotPasswordController");
const {
  resetPassword,
} = require("../controllers/auth/resetPasswordController");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
