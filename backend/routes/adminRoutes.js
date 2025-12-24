// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/authAdmin");

// Controllers
const { getStats } = require("../controllers/admin/statsController");
const {
  getUsers,
  blockUser,
  createUserByAdmin,
} = require("../controllers/admin/userController");
const {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  approveTransaction,
  rejectTransaction,
} = require("../controllers/admin/packageController");

const {
  getPendingTransactions,
} = require("../controllers/users/trasactionController");

const {
  getAllPosts,
  getPostById,
  updatePostStatus,
} = require("../controllers/admin/adminPostController");

// ===== DASHBOARD =====
router.get("/stats", adminAuth, getStats);

// ===== USERS =====
router.get("/users", adminAuth, getUsers);
router.post("/users", adminAuth, createUserByAdmin);
router.patch("/users/:id/block", adminAuth, blockUser);

// ===== POSTS =====
router.get("/posts", adminAuth, getAllPosts);
router.get("/posts/:id", adminAuth, getPostById);
router.patch("/posts/:id/status", adminAuth, updatePostStatus);

// ===== PACKAGES =====
router.post("/packages", adminAuth, createPackage);
router.get("/packages", adminAuth, getAllPackages);
router.get("/packages/:id", adminAuth, getPackageById);
router.put("/packages/:id", adminAuth, updatePackage);
router.delete("/packages/:id", adminAuth, deletePackage);

// ===== TRANSACTIONS =====
router.get("/transactions/pending", adminAuth, getPendingTransactions);
router.patch("/transactions/:id/approve", adminAuth, approveTransaction);
router.patch("/transactions/:id/reject", adminAuth, rejectTransaction);
module.exports = router;
