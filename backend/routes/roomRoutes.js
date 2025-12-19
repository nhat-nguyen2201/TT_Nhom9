// routes/postRoutes.js (hoặc post.js)
const express = require("express");
const router = express.Router();
const { getRoomDetail } = require("../controllers/post/roomController");

router.get("/:id", getRoomDetail);

module.exports = router;
