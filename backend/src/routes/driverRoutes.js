const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");

const router = express.Router();

// Protect all driver management routes
router.use(protect);

// Only ADMIN can manage drivers
router.use(allowRoles("ADMIN"));

// Create driver
router.post("/", createDriver);

// Get all drivers
router.get("/", getDrivers);

// Get driver by ID
router.get("/:id", getDriverById);

// Update driver
router.put("/:id", updateDriver);

// Delete driver
router.delete("/:id", deleteDriver);

module.exports = router;