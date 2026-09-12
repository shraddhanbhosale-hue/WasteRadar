const Driver = require("../models/Driver");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

// CREATE DRIVER
const createDriver = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      vehicleId,
      status,
    } = req.body;

    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    if (!userId || !name) {
      return res.status(400).json({
        message: "userId and name are required",
      });
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check duplicate driver
    const existingDriver = await Driver.findOne({ userId });

    if (existingDriver) {
      return res.status(400).json({
        message: "Driver already exists for this user",
      });
    }

    // If vehicle provided, validate it
    if (vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: vehicleId,
        villageId,
      });

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found in this village",
        });
      }

      if (vehicle.status !== "AVAILABLE") {
        return res.status(400).json({
          message: "Vehicle is not available",
        });
      }
    }

    const driver = await Driver.create({
      userId,
      name,
      phone,
      villageId,
      vehicleId: vehicleId || null,
      status: status || "OFFLINE",
    });

    // Update user role and village
    user.role = "DRIVER";
    user.villageId = villageId;
    await user.save();

    // Assign vehicle to driver
    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, {
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

    res.status(201).json({
      message: "Driver created successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Create driver error:", error.message);

    res.status(500).json({
      message: "Unable to create driver",
    });
  }
};

// GET ALL DRIVERS
const getDrivers = async (req, res) => {
  try {
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const drivers = await Driver.find({ villageId })
      .populate("userId", "name email phone role")
      .populate("villageId", "name district state")
      .populate(
        "vehicleId",
        "vehicleNumber vehicleType capacity status"
      )
      .sort({ createdAt: -1 });

    res.json({
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("Get drivers error:", error.message);

    res.status(500).json({
      message: "Unable to load drivers",
    });
  }
};

// GET DRIVER BY ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const driver = await Driver.findOne({
      _id: id,
      villageId,
    })
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

    res.json({
      driver,
    });
  } catch (error) {
    console.error("Get driver error:", error.message);

    res.status(500).json({
      message: "Unable to load driver",
    });
  }
};

// UPDATE DRIVER
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      vehicleId,
      status,
    } = req.body;

    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const driver = await Driver.findOne({
      _id: id,
      villageId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    // Vehicle change
    if (vehicleId !== undefined) {
      if (vehicleId) {
        const vehicle = await Vehicle.findOne({
          _id: vehicleId,
          villageId,
        });

        if (!vehicle) {
          return res.status(404).json({
            message: "Vehicle not found in this village",
          });
        }

        if (
          vehicle.status !== "AVAILABLE" &&
          vehicle._id.toString() !== driver.vehicleId?.toString()
        ) {
          return res.status(400).json({
            message: "Vehicle is not available",
          });
        }

        // Release old vehicle
        if (
          driver.vehicleId &&
          driver.vehicleId.toString() !== vehicle._id.toString()
        ) {
          await Vehicle.findByIdAndUpdate(driver.vehicleId, {
            driverId: null,
            status: "AVAILABLE",
          });
        }

        // Assign new vehicle
        vehicle.driverId = driver._id;
        vehicle.status = "ASSIGNED";
        await vehicle.save();

        driver.vehicleId = vehicle._id;
      } else {
        // Remove vehicle
        if (driver.vehicleId) {
          await Vehicle.findByIdAndUpdate(driver.vehicleId, {
            driverId: null,
            status: "AVAILABLE",
          });
        }

        driver.vehicleId = null;
      }
    }

    if (name !== undefined) {
      driver.name = name;
    }

    if (phone !== undefined) {
      driver.phone = phone;
    }

    if (status !== undefined) {
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

    res.json({
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Update driver error:", error.message);

    res.status(500).json({
      message: "Unable to update driver",
    });
  }
};

// DELETE DRIVER
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const driver = await Driver.findOne({
      _id: id,
      villageId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    // Release assigned vehicle
    if (driver.vehicleId) {
      await Vehicle.findByIdAndUpdate(driver.vehicleId, {
        driverId: null,
        status: "AVAILABLE",
      });
    }

    // Change user role back to citizen
    await User.findByIdAndUpdate(driver.userId, {
      role: "CITIZEN",
    });

    await driver.deleteOne();

    res.json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error("Delete driver error:", error.message);

    res.status(500).json({
      message: "Unable to delete driver",
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