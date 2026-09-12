const express = require("express");

const {
  createReport,
  getMyReports,
  getReportById,
  deleteReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("image"),
  createReport
);

router.get(
  "/",
  protect,
  getMyReports
);

router.get(
  "/:id",
  protect,
  getReportById
);

router.delete(
  "/:id",
  protect,
  deleteReport
);

module.exports = router;