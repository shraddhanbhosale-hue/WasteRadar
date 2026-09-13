const mongoose = require("mongoose");

const Driver = require("../models/Driver");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const bcrypt = require("bcryptjs");

const createDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleId,
      status,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Driver name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Driver email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Driver password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

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

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: "DRIVER",
    });

    const driver = await Driver.create({
      userId: user._id,
      name: name.trim(),
      phone: phone ? phone.trim() : "",
      villageId: vehicle.villageId || null,
      vehicleId: vehicle._id,
      status: driverStatus,
    });

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
      message: "Driver account created successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Create driver error:", error);

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

      if (newVehicle.villageId) {
        driver.villageId = newVehicle.villageId;
      }

      await Vehicle.findByIdAndUpdate(newVehicle._id, {
        driverId: driver._id,
        status: "ASSIGNED",
      });

      /*
       * Important:
       * Assigning a vehicle to a driver does NOT mean
       * the driver is currently doing a task.
       *
       * Driver remains AVAILABLE until a report/task
       * is actually assigned.
       */
      if (driver.status !== "ON_TASK") {
        driver.status = "AVAILABLE";
      }
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
