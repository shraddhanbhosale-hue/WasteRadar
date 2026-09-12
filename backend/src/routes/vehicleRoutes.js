const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const router = express.Router();

// Protect all vehicle management routes
router.use(protect);

// Only ADMIN can manage vehicles
router.use(allowRoles("ADMIN"));

// Create vehicle
router.post("/", createVehicle);

// Get all vehicles
router.get("/", getVehicles);

// Get vehicle by ID
router.get("/:id", getVehicleById);

// Update vehicle
router.put("/:id", updateVehicle);

// Delete vehicle
router.delete("/:id", deleteVehicle);

module.exports = router;