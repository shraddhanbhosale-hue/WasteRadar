const WasteReport = require("../models/WasteReport");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

// ==========================================
// GET DRIVER TASKS
// ==========================================
const getDriverTasks = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      userId: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    if (!driver.villageId) {
      return res.status(400).json({
        message: "Driver village is not assigned",
      });
    }

    const reports = await WasteReport.find({
      driverId: driver._id,
      villageId: driver.villageId,
      status: {
        $in: ["VEHICLE_ASSIGNED", "IN_PROGRESS"],
      },
    })
      .populate("userId", "name email phone")
      .populate("villageId", "name district state")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status driverId"
      )
      .sort({ createdAt: -1 });

    return res.json({
      count: reports.length,
      tasks: reports,
    });
  } catch (error) {
    console.error("Get driver tasks error:", error);

    return res.status(500).json({
      message: "Unable to load driver tasks",
      error: error.message,
    });
  }
};

// ==========================================
// START DRIVER TASK
// ==========================================
const startTask = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({
      userId: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    if (!driver.villageId) {
      return res.status(400).json({
        message: "Driver village is not assigned",
      });
    }

    if (!driver.vehicleId) {
      return res.status(400).json({
        message: "No vehicle assigned to this driver",
      });
    }

    const report = await WasteReport.findOne({
      _id: id,
      driverId: driver._id,
      villageId: driver.villageId,
      status: "VEHICLE_ASSIGNED",
    });

    if (!report) {
      return res.status(404).json({
        message: "Assigned task not found for this driver",
      });
    }

    report.status = "IN_PROGRESS";
    await report.save();

    driver.status = "ON_TASK";
    await driver.save();

    await Vehicle.findByIdAndUpdate(driver.vehicleId, {
      status: "ON_ROUTE",
    });

    return res.json({
      message: "Waste collection task started successfully",
      report,
    });
  } catch (error) {
    console.error("Start task error:", error);

    return res.status(500).json({
      message: "Unable to start task",
      error: error.message,
    });
  }
};

// ==========================================
// COMPLETE DRIVER TASK
// ==========================================
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({
      userId: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    if (!driver.villageId) {
      return res.status(400).json({
        message: "Driver village is not assigned",
      });
    }

    const report = await WasteReport.findOne({
      _id: id,
      driverId: driver._id,
      villageId: driver.villageId,
      status: "IN_PROGRESS",
    });

    if (!report) {
      return res.status(404).json({
        message: "Active task not found for this driver",
      });
    }

    const vehicleId = driver.vehicleId;

    report.status = "RESOLVED";
    await report.save();

    driver.status = "AVAILABLE";
    await driver.save();

    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, {
        driverId: driver._id,
        status: "ASSIGNED",
      });
    }

    return res.json({
      message: "Waste collection completed successfully",
      report,
    });
  } catch (error) {
    console.error("Complete task error:", error);

    return res.status(500).json({
      message: "Unable to complete task",
      error: error.message,
    });
  }
};

module.exports = {
  getDriverTasks,
  startTask,
  completeTask,
};