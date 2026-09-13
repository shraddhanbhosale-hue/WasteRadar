const mongoose = require("mongoose");

const Driver = require("../models/Driver");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const createDriver = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      vehicleId,
      status,
    } = req.body;

    if (!userId || !name || !name.trim()) {
      return res.status(400).json({
        message: "userId and name are required",
      });
    }

    if (!vehicleId) {
      return res.status(400).json({
        message: "Vehicle assignment is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "CITIZEN") {
      return res.status(400).json({
        message: "Only CITIZEN users can be converted to drivers",
      });
    }

    const existingDriver = await Driver.findOne({
      userId,
    });

    if (existingDriver) {
      return res.status(409).json({
        message: "Driver already exists for this user",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Vehicle is not available",
      });
    }

    if (vehicle.driverId) {
      return res.status(400).json({
        message: "Vehicle is already assigned to another driver",
      });
    }

    const allowedStatuses = [
      "AVAILABLE",
      "ON_TASK",
      "OFFLINE",
    ];

    const driverStatus = status || "AVAILABLE";

    if (!allowedStatuses.includes(driverStatus)) {
      return res.status(400).json({
        message: "Invalid driver status",
      });
    }

    const driver = await Driver.create({
      userId,
      name: name.trim(),
      phone: phone ? phone.trim() : "",
      villageId: null,
      vehicleId: vehicle._id,
      status: driverStatus,
    });

    user.role = "DRIVER";
    await user.save();

    await Vehicle.findByIdAndUpdate(vehicle._id, {
      driverId: driver._id,
      status: "ASSIGNED",
    });

    const populatedDriver = await Driver.findById(driver._id)
      .populate("userId", "name email phone role")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      );

    return res.status(201).json({
      message: "Driver created and vehicle assigned successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Create driver error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Driver validation failed",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      message: "Unable to create driver",
      error: error.message,
    });
  }
};

const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "name email phone role")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      )
      .sort({ createdAt: -1 });

    return res.json({
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("Get drivers error:", error);

    return res.status(500).json({
      message: "Unable to load drivers",
      error: error.message,
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid driver ID",
      });
    }

    const driver = await Driver.findById(id)
      .populate("userId", "name email phone role")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    return res.json({
      driver,
    });
  } catch (error) {
    console.error("Get driver error:", error);

    return res.status(500).json({
      message: "Unable to load driver",
      error: error.message,
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid driver ID",
      });
    }

    const {
      name,
      phone,
      vehicleId,
      status,
    } = req.body;

    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Driver name is required",
        });
      }

      driver.name = name.trim();
    }

    if (phone !== undefined) {
      driver.phone = phone.trim();
    }

    if (vehicleId !== undefined) {
      if (!vehicleId) {
        return res.status(400).json({
          message: "Vehicle assignment is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return res.status(400).json({
          message: "Invalid vehicle ID",
        });
      }

      const newVehicle = await Vehicle.findById(vehicleId);

      if (!newVehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      if (
        newVehicle.driverId &&
        newVehicle.driverId.toString() !==
          driver._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Vehicle is already assigned to another driver",
        });
      }

      if (
        newVehicle.status !== "AVAILABLE" &&
        newVehicle.driverId?.toString() !==
          driver._id.toString()
      ) {
        return res.status(400).json({
          message: "Vehicle is not available",
        });
      }

      const oldVehicleId = driver.vehicleId;

      if (
        oldVehicleId &&
        oldVehicleId.toString() !==
          newVehicle._id.toString()
      ) {
        await Vehicle.findByIdAndUpdate(oldVehicleId, {
          driverId: null,
          status: "AVAILABLE",
        });
      }

      driver.vehicleId = newVehicle._id;

      await Vehicle.findByIdAndUpdate(newVehicle._id, {
        driverId: driver._id,
        status: "ASSIGNED",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "AVAILABLE",
        "ON_TASK",
        "OFFLINE",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid driver status",
        });
      }

      driver.status = status;
    }

    await driver.save();

    const updatedDriver = await Driver.findById(driver._id)
      .populate("userId", "name email phone role")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      );

    return res.json({
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Update driver error:", error);

    return res.status(500).json({
      message: "Unable to update driver",
      error: error.message,
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid driver ID",
      });
    }

    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (driver.vehicleId) {
      await Vehicle.findByIdAndUpdate(driver.vehicleId, {
        driverId: null,
        status: "AVAILABLE",
      });
    }

    await User.findByIdAndUpdate(driver.userId, {
      role: "CITIZEN",
    });

    await driver.deleteOne();

    return res.json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error("Delete driver error:", error);

    return res.status(500).json({
      message: "Unable to delete driver",
      error: error.message,
    });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
};