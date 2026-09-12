const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDriverTasks,
  startTask,
  completeTask,
} = require("../controllers/driverTaskController");

const router = express.Router();

// Protect all driver task routes
router.use(protect);

// Only DRIVER can access these routes
router.use(allowRoles("DRIVER"));

// Get driver's assigned tasks
router.get("/tasks", getDriverTasks);

// Start a waste collection task
router.put("/tasks/:id/start", startTask);

// Complete a waste collection task
router.put("/tasks/:id/complete", completeTask);

module.exports = router;