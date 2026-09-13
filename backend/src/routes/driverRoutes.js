const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDriverTasks,
  startTask,
  completeTask,
} = require("../controllers/driverTaskController");

const router = express.Router();

router.use(protect);

router.use(allowRoles("DRIVER"));

router.get("/tasks", getDriverTasks);

router.put("/tasks/:id/start", startTask);

router.put("/tasks/:id/complete", completeTask);

module.exports = router;