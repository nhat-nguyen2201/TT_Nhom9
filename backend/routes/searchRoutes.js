// FILE: routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/users/searchController");

// Route tìm kiếm nâng cao
router.get("/advanced", searchController.advancedSearch);

// Route gợi ý tìm kiếm (autocomplete)
router.get("/suggestions", searchController.getSuggestions);

// Route thống kê giá
router.get("/stats/price", searchController.getPriceStats);

// Route lấy filter options (cities, room_types, districts)
router.get("/filters", searchController.getFilterOptions);

// Route tìm kiếm nhanh (từ header)
router.get("/quick", searchController.quickSearch);

module.exports = router;
