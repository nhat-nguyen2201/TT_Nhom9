// File: routes/searchRoutes.js  (phải đúng tên và vị trí này)

const express = require("express");
const router = express.Router();

const searchController = require("../controllers/post/searchController");

// BẮT BUỘC PHẢI CÓ DẤU / TRƯỚC search
router.get("/advanced", searchController.advancedSearch);
router.get("/suggestions", searchController.getSuggestions);
router.get("/stats", searchController.getPriceStats);
router.get("/filters", searchController.getFilterOptions);
module.exports = router;
