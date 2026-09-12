const express = require("express");

const {
  getAllReports,
  getDashboardStats,
  approveReport,
  rejectReport,
  assignVehicle,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  role("ADMIN"),
  getDashboardStats
);

router.get(
  "/reports",
  protect,
  role("ADMIN"),
  getAllReports
);

router.put(
  "/reports/:id/approve",
  protect,
  role("ADMIN"),
  approveReport
);

router.put(
  "/reports/:id/reject",
  protect,
  role("ADMIN"),
  rejectReport
);

router.put(
  "/reports/:id/assign-vehicle",
  protect,
  role("ADMIN"),
  assignVehicle
);

module.exports = router;