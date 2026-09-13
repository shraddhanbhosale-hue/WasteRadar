const mongoose = require("mongoose");

const Driver = require("../models/Driver");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Village = require("../models/Village");

// CREATE DRIVER
const createDriver = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      villageId,
      vehicleId,
      status,
    } = req.body;

    if (!userId || !name || !name.trim()) {
      return res.status(400).json({
        message: "userId and name are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
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

    let validVillageId = null;

    if (villageId) {
      if (!mongoose.Types.ObjectId.isValid(villageId)) {
        return res.status(400).json({
          message: "Invalid village ID",
        });
      }

      const village = await Village.findById(villageId);

      if (!village) {
        return res.status(404).json({
          message: "Village not found",
        });
      }

      validVillageId = villageId;
    }

    let validVehicleId = null;

    if (vehicleId) {
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return res.status(400).json({
          message: "Invalid vehicle ID",
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

      validVehicleId = vehicleId;
    }

    const allowedStatuses = [
      "AVAILABLE",
      "ON_TASK",
      "OFFLINE",
    ];

    const driverStatus = status || "OFFLINE";

    if (!allowedStatuses.includes(driverStatus)) {
      return res.status(400).json({
        message: "Invalid driver status",
      });
    }

    const driver = await Driver.create({
      userId,
      name: name.trim(),
      phone: phone ? phone.trim() : "",
      villageId: validVillageId,
      vehicleId: validVehicleId,
      status: driverStatus,
    });

    user.role = "DRIVER";

    if (validVillageId) {
      user.villageId = validVillageId;
    }

    await user.save();

    if (validVehicleId) {
      await Vehicle.findByIdAndUpdate(validVehicleId, {
        driverId: driver._id,
        status: "ASSIGNED",
      });
    }

    const populatedDriver = await Driver.findById(driver._id)
      .populate("userId", "name email phone role")
      .populate("villageId", "name district state")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      );

    return res.status(201).json({
      message: "Driver created successfully",
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

// GET ALL DRIVERS
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "name email phone role")
      .populate("villageId", "name district state")
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

// GET DRIVER BY ID
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
      .populate("villageId", "name district state")
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

// UPDATE DRIVER
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
      villageId,
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

    if (villageId !== undefined) {
      if (villageId === null || villageId === "") {
        driver.villageId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(villageId)) {
          return res.status(400).json({
            message: "Invalid village ID",
          });
        }

        const village = await Village.findById(villageId);

        if (!village) {
          return res.status(404).json({
            message: "Village not found",
          });
        }

        driver.villageId = villageId;
      }
    }

    if (vehicleId !== undefined) {
      const oldVehicleId = driver.vehicleId;

      if (vehicleId === null || vehicleId === "") {
        if (oldVehicleId) {
          await Vehicle.findByIdAndUpdate(oldVehicleId, {
            driverId: null,
            status: "AVAILABLE",
          });
        }

        driver.vehicleId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
          return res.status(400).json({
            message: "Invalid vehicle ID",
          });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
          return res.status(404).json({
            message: "Vehicle not found",
          });
        }

        if (
          vehicle.driverId &&
          vehicle.driverId.toString() !==
            driver._id.toString()
        ) {
          return res.status(400).json({
            message:
              "Vehicle is already assigned to another driver",
          });
        }

        if (
          vehicle.status !== "AVAILABLE" &&
          vehicle.driverId?.toString() !==
            driver._id.toString()
        ) {
          return res.status(400).json({
            message: "Vehicle is not available",
          });
        }

        if (
          oldVehicleId &&
          oldVehicleId.toString() !==
            vehicle._id.toString()
        ) {
          await Vehicle.findByIdAndUpdate(oldVehicleId, {
            driverId: null,
            status: "AVAILABLE",
          });
        }

        driver.vehicleId = vehicle._id;

        await Vehicle.findByIdAndUpdate(vehicle._id, {
          driverId: driver._id,
          status: "ASSIGNED",
        });
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
      .populate("villageId", "name district state")
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

// DELETE DRIVER
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