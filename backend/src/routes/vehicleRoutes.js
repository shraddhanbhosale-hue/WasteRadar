const express = require("express");
const mongoose = require("mongoose");

const Vehicle = require("../models/Vehicle");
const Village = require("../models/Village");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
  CREATE VEHICLE
  Admin only
*/
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can create vehicles",
      });
    }

    const {
      vehicleNumber,
      type,
      capacity,
      status,
      villageId,
      driverId,
    } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        message: "Vehicle number is required",
      });
    }

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
    }

    const existingVehicle = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.trim(),
    });

    if (existingVehicle) {
      return res.status(409).json({
        message: "Vehicle number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.trim(),
      type,
      capacity,
      status: status || "AVAILABLE",
      villageId: villageId || null,
      driverId: driverId || null,
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("villageId", "name district state")
      .populate("driverId", "name email");

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle: populatedVehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    res.status(500).json({
      message: "Unable to create vehicle",
      error: error.message,
    });
  }
});

/*
  GET ALL VEHICLES
  Admin
*/
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can view vehicles",
      });
    }

    const vehicles = await Vehicle.find()
      .populate("villageId", "name district state")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);

    res.status(500).json({
      message: "Unable to fetch vehicles",
    });
  }
});

/*
  GET AVAILABLE VEHICLES
*/
router.get("/available", protect, async (req, res) => {
  try {
    const { villageId } = req.query;

    const filter = {
      status: "AVAILABLE",
    };

    if (villageId) {
      if (!mongoose.Types.ObjectId.isValid(villageId)) {
        return res.status(400).json({
          message: "Invalid village ID",
        });
      }

      filter.villageId = villageId;
    }

    const vehicles = await Vehicle.find(filter)
      .populate("villageId", "name district state")
      .populate("driverId", "name email")
      .sort({ vehicleNumber: 1 });

    res.json(vehicles);
  } catch (error) {
    console.error("Get available vehicles error:", error);

    res.status(500).json({
      message: "Unable to fetch available vehicles",
    });
  }
});

/*
  GET SINGLE VEHICLE
*/
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await Vehicle.findById(id)
      .populate("villageId", "name district state")
      .populate("driverId", "name email");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);

    res.status(500).json({
      message: "Unable to fetch vehicle",
    });
  }
});

/*
  UPDATE VEHICLE
*/
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can update vehicles",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const {
      vehicleNumber,
      type,
      capacity,
      status,
      villageId,
      driverId,
    } = req.body;

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
    }

    if (vehicleNumber) {
      const duplicate = await Vehicle.findOne({
        vehicleNumber: vehicleNumber.trim(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Vehicle number already exists",
        });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        ...(vehicleNumber !== undefined && {
          vehicleNumber: vehicleNumber.trim(),
        }),
        ...(type !== undefined && { type }),
        ...(capacity !== undefined && { capacity }),
        ...(status !== undefined && { status }),
        ...(villageId !== undefined && { villageId }),
        ...(driverId !== undefined && { driverId }),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("villageId", "name district state")
      .populate("driverId", "name email");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    res.status(500).json({
      message: "Unable to update vehicle",
      error: error.message,
    });
  }
});

/*
  DELETE VEHICLE
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can delete vehicles",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    res.status(500).json({
      message: "Unable to delete vehicle",
    });
  }
});

module.exports = router;