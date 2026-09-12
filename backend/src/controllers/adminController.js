const WasteReport = require("../models/WasteReport");
const Vehicle = require("../models/Vehicle");

// ==========================================
// GET ALL WASTE REPORTS
// ==========================================

const getAllReports = async (req, res) => {
  try {
    const filter = {};

    // Admin sees reports from their village
    if (req.user.villageId) {
      filter.villageId = req.user.villageId;
    }

    const reports = await WasteReport.find(filter)
      .populate("userId", "name email phone")
      .populate("villageId", "name district state")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status driverId"
      )
      .sort({ createdAt: -1 });

    res.json({
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error(
      "Get all reports error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch all reports",
    });
  }
};

// ==========================================
// GET ADMIN DASHBOARD STATISTICS
// ==========================================

const getDashboardStats = async (req, res) => {
  try {
    const filter = {};

    if (req.user.villageId) {
      filter.villageId = req.user.villageId;
    }

    const totalReports =
      await WasteReport.countDocuments(filter);

    const pendingReports =
      await WasteReport.countDocuments({
        ...filter,
        status: {
          $in: [
            "REPORTED",
            "AI_VERIFIED",
            "ADMIN_REVIEW",
          ],
        },
      });

    const vehicleAssigned =
      await WasteReport.countDocuments({
        ...filter,
        status: "VEHICLE_ASSIGNED",
      });

    const inProgress =
      await WasteReport.countDocuments({
        ...filter,
        status: "IN_PROGRESS",
      });

    const resolvedReports =
      await WasteReport.countDocuments({
        ...filter,
        status: "RESOLVED",
      });

    const rejectedReports =
      await WasteReport.countDocuments({
        ...filter,
        status: "REJECTED",
      });

    const highSeverityReports =
      await WasteReport.countDocuments({
        ...filter,
        severity: "High",
      });

    res.json({
      totalReports,
      pendingReports,
      vehicleAssigned,
      inProgress,
      resolvedReports,
      rejectedReports,
      highSeverityReports,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to fetch dashboard statistics",
    });
  }
};

// ==========================================
// APPROVE WASTE REPORT
// ==========================================

const approveReport = async (req, res) => {
  try {
    const report = await WasteReport.findOne({
      _id: req.params.id,
      ...(req.user.villageId && {
        villageId: req.user.villageId,
      }),
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (
      ![
        "REPORTED",
        "AI_VERIFIED",
        "ADMIN_REVIEW",
      ].includes(report.status)
    ) {
      return res.status(400).json({
        message:
          "This report cannot be approved in its current status",
      });
    }

    report.status = "ADMIN_REVIEW";

    await report.save();

    res.json({
      message: "Report approved successfully",
      report,
    });
  } catch (error) {
    console.error(
      "Approve report error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to approve report",
    });
  }
};

// ==========================================
// REJECT WASTE REPORT
// ==========================================

const rejectReport = async (req, res) => {
  try {
    const report = await WasteReport.findOne({
      _id: req.params.id,
      ...(req.user.villageId && {
        villageId: req.user.villageId,
      }),
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (
      ![
        "REPORTED",
        "AI_VERIFIED",
        "ADMIN_REVIEW",
      ].includes(report.status)
    ) {
      return res.status(400).json({
        message:
          "This report cannot be rejected in its current status",
      });
    }

    report.status = "REJECTED";

    await report.save();

    res.json({
      message: "Report rejected successfully",
      report,
    });
  } catch (error) {
    console.error(
      "Reject report error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to reject report",
    });
  }
};

// ==========================================
// ASSIGN VEHICLE TO WASTE REPORT
// ==========================================

const assignVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        message: "Vehicle ID is required",
      });
    }

    const report = await WasteReport.findOne({
      _id: id,
      ...(req.user.villageId && {
        villageId: req.user.villageId,
      }),
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (report.status !== "ADMIN_REVIEW") {
      return res.status(400).json({
        message:
          "Only approved reports can be assigned to a vehicle",
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      ...(req.user.villageId && {
        villageId: req.user.villageId,
      }),
    });

    if (!vehicle) {
      return res.status(404).json({
        message:
          "Vehicle not found in your village",
      });
    }

    if (vehicle.status !== "AVAILABLE") {
      return res.status(400).json({
        message:
          "Selected vehicle is not available",
      });
    }

    report.vehicleId = vehicle._id;
    report.status = "VEHICLE_ASSIGNED";

    await report.save();

    vehicle.status = "ASSIGNED";

    await vehicle.save();

    const updatedReport =
      await WasteReport.findById(report._id)
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "villageId",
          "name district state"
        )
        .populate(
          "vehicleId",
          "vehicleNumber vehicleType capacity status driverId"
        );

    res.json({
      message:
        "Vehicle assigned successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error(
      "Assign vehicle error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to assign vehicle",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getAllReports,
  getDashboardStats,
  approveReport,
  rejectReport,
  assignVehicle,
};