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

router.use(protect);

router.use(allowRoles("ADMIN"));

router.post("/", createDriver);

router.get("/", getDrivers);

router.get("/:id", getDriverById);

router.put("/:id", updateDriver);

router.delete("/:id", deleteDriver);

module.exports = router;