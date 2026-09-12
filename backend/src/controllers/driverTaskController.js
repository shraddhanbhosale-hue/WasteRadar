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
      villageId: req.user.villageId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    const reports = await WasteReport.find({
      villageId: driver.villageId,
      status: {
        $in: ["VEHICLE_ASSIGNED", "IN_PROGRESS"],
      },
    })
      .populate("userId", "name email phone")
      .populate("villageId", "name district state")
      .sort({ createdAt: -1 });

    res.json({
      count: reports.length,
      tasks: reports,
    });
  } catch (error) {
    console.error("Get driver tasks error:", error.message);

    res.status(500).json({
      message: "Unable to load driver tasks",
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
      villageId: req.user.villageId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    if (!driver.vehicleId) {
      return res.status(400).json({
        message: "No vehicle assigned to this driver",
      });
    }

    const report = await WasteReport.findOne({
      _id: id,
      villageId: driver.villageId,
      status: "VEHICLE_ASSIGNED",
    });

    if (!report) {
      return res.status(404).json({
        message: "Assigned task not found",
      });
    }

    // Change report status
    report.status = "IN_PROGRESS";
    await report.save();

    // Change driver status
    driver.status = "ON_TASK";
    await driver.save();

    // Change vehicle status
    await Vehicle.findByIdAndUpdate(driver.vehicleId, {
      status: "ON_ROUTE",
    });

    res.json({
      message: "Waste collection task started successfully",
      report,
    });
  } catch (error) {
    console.error("Start task error:", error.message);

    res.status(500).json({
      message: "Unable to start task",
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
      villageId: req.user.villageId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    const report = await WasteReport.findOne({
      _id: id,
      villageId: driver.villageId,
      status: "IN_PROGRESS",
    });

    if (!report) {
      return res.status(404).json({
        message: "Active task not found",
      });
    }

    // Save vehicle ID before removing it from driver
    const vehicleId = driver.vehicleId;

    // Change report status
    report.status = "RESOLVED";
    await report.save();

    // Make driver available
    driver.status = "AVAILABLE";
    driver.vehicleId = null;
    await driver.save();

    // Make vehicle available
    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, {
        driverId: null,
        status: "AVAILABLE",
      });
    }

    res.json({
      message: "Waste collection completed successfully",
      report,
    });
  } catch (error) {
    console.error("Complete task error:", error.message);

    res.status(500).json({
      message: "Unable to complete task",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getDriverTasks,
  startTask,
  completeTask,
};