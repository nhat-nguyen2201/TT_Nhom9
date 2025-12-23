const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/users/trasactionController");

router.post("/create", transactionController.createTransaction);

module.exports = router;
