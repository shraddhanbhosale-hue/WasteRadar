const express = require("express");

const {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  getUsers,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Normal authentication
router.post("/register", registerUser);

router.post("/login", loginUser);

// Google authentication
router.post("/google", googleLogin);

// Current logged-in user
router.get("/me", protect, getMe);

// Admin - get citizen users
router.get(
  "/users",
  protect,
  allowRoles("ADMIN"),
  getUsers
);

module.exports = router;