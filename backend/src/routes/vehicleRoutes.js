const express = require("express");
const mongoose = require("mongoose");

const Vehicle = require("../models/Vehicle");
const Village = require("../models/Village");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const isAdmin = (req) => {
  return req.user && req.user.role === "ADMIN";
};

/*
  CREATE VEHICLE
  POST /api/vehicles
*/
router.post("/", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only admins can create vehicles",
      });
    }

    const {
      vehicleNumber,
      vehicleType,
      capacity,
      villageId,
      driverId,
      depotAddress,
      depotLatitude,
      depotLongitude,
      currentLatitude,
      currentLongitude,
      status,
    } = req.body;

    if (!vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({
        message: "Vehicle number is required",
      });
    }

    if (capacity === undefined || capacity === null || capacity === "") {
      return res.status(400).json({
        message: "Capacity is required",
      });
    }

    const numericCapacity = Number(capacity);

    if (Number.isNaN(numericCapacity) || numericCapacity <= 0) {
      return res.status(400).json({
        message: "Capacity must be a valid positive number",
      });
    }

    if (!villageId) {
      return res.status(400).json({
        message: "Village is required",
      });
    }

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

    const existingVehicle = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.trim(),
    });

    if (existingVehicle) {
      return res.status(409).json({
        message: "Vehicle number already exists",
      });
    }

    if (driverId) {
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res.status(400).json({
          message: "Invalid driver ID",
        });
      }
    }

    const allowedStatuses = [
      "AVAILABLE",
      "ASSIGNED",
      "ON_ROUTE",
      "COLLECTING",
      "MAINTENANCE",
    ];

    const vehicleStatus = status || "AVAILABLE";

    if (!allowedStatuses.includes(vehicleStatus)) {
      return res.status(400).json({
        message: "Invalid vehicle status",
      });
    }

    const vehicle = new Vehicle({
      vehicleNumber: vehicleNumber.trim(),
      vehicleType: vehicleType ? vehicleType.trim() : "",
      capacity: numericCapacity,
      villageId,
      driverId: driverId || null,
      depotAddress: depotAddress ? depotAddress.trim() : "",
      depotLatitude:
        depotLatitude !== undefined &&
        depotLatitude !== null &&
        depotLatitude !== ""
          ? Number(depotLatitude)
          : undefined,
      depotLongitude:
        depotLongitude !== undefined &&
        depotLongitude !== null &&
        depotLongitude !== ""
          ? Number(depotLongitude)
          : undefined,
      currentLatitude:
        currentLatitude !== undefined &&
        currentLatitude !== null &&
        currentLatitude !== ""
          ? Number(currentLatitude)
          : undefined,
      currentLongitude:
        currentLongitude !== undefined &&
        currentLongitude !== null &&
        currentLongitude !== ""
          ? Number(currentLongitude)
          : undefined,
      status: vehicleStatus,
    });

    await vehicle.save();

    const savedVehicle = await Vehicle.findById(vehicle._id)
      .populate("villageId", "name district state")
      .populate("driverId");

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle: savedVehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Vehicle number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Vehicle validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Unable to create vehicle",
      error: error.message,
    });
  }
});

/*
  GET ALL VEHICLES
  GET /api/vehicles
*/
router.get("/", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only admins can view vehicles",
      });
    }

    const vehicles = await Vehicle.find()
      .populate("villageId", "name district state")
      .populate("driverId")
      .sort({ createdAt: -1 });

    return res.json(vehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      message: "Unable to fetch vehicles",
      error: error.message,
    });
  }
});

/*
  GET AVAILABLE VEHICLES
  GET /api/vehicles/available
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
      .populate("driverId")
      .sort({ vehicleNumber: 1 });

    return res.json(vehicles);
  } catch (error) {
    console.error("Get available vehicles error:", error);

    return res.status(500).json({
      message: "Unable to fetch available vehicles",
      error: error.message,
    });
  }
});

/*
  GET VEHICLES BY VILLAGE
  GET /api/vehicles/village/:villageId
*/
router.get("/village/:villageId", protect, async (req, res) => {
  try {
    const { villageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(villageId)) {
      return res.status(400).json({
        message: "Invalid village ID",
      });
    }

    const vehicles = await Vehicle.find({
      villageId,
    })
      .populate("villageId", "name district state")
      .populate("driverId")
      .sort({ vehicleNumber: 1 });

    return res.json(vehicles);
  } catch (error) {
    console.error("Get village vehicles error:", error);

    return res.status(500).json({
      message: "Unable to fetch village vehicles",
      error: error.message,
    });
  }
});

/*
  GET SINGLE VEHICLE
  GET /api/vehicles/:id
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
      .populate("driverId");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      message: "Unable to fetch vehicle",
      error: error.message,
    });
  }
});

/*
  UPDATE VEHICLE
  PUT /api/vehicles/:id
*/
router.put("/:id", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
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
      vehicleType,
      capacity,
      villageId,
      driverId,
      depotAddress,
      depotLatitude,
      depotLongitude,
      currentLatitude,
      currentLongitude,
      status,
    } = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicleNumber !== undefined) {
      if (!vehicleNumber.trim()) {
        return res.status(400).json({
          message: "Vehicle number is required",
        });
      }

      const duplicate = await Vehicle.findOne({
        vehicleNumber: vehicleNumber.trim(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Vehicle number already exists",
        });
      }

      vehicle.vehicleNumber = vehicleNumber.trim();
    }

    if (vehicleType !== undefined) {
      vehicle.vehicleType = vehicleType.trim();
    }

    if (capacity !== undefined) {
      const numericCapacity = Number(capacity);

      if (Number.isNaN(numericCapacity) || numericCapacity <= 0) {
        return res.status(400).json({
          message: "Capacity must be a valid positive number",
        });
      }

      vehicle.capacity = numericCapacity;
    }

    if (villageId !== undefined) {
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

      vehicle.villageId = villageId;
    }

    if (driverId !== undefined) {
      if (driverId === null || driverId === "") {
        vehicle.driverId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(driverId)) {
          return res.status(400).json({
            message: "Invalid driver ID",
          });
        }

        vehicle.driverId = driverId;
      }
    }

    if (depotAddress !== undefined) {
      vehicle.depotAddress = depotAddress.trim();
    }

    if (depotLatitude !== undefined) {
      vehicle.depotLatitude =
        depotLatitude === "" || depotLatitude === null
          ? undefined
          : Number(depotLatitude);
    }

    if (depotLongitude !== undefined) {
      vehicle.depotLongitude =
        depotLongitude === "" || depotLongitude === null
          ? undefined
          : Number(depotLongitude);
    }

    if (currentLatitude !== undefined) {
      vehicle.currentLatitude =
        currentLatitude === "" || currentLatitude === null
          ? undefined
          : Number(currentLatitude);
    }

    if (currentLongitude !== undefined) {
      vehicle.currentLongitude =
        currentLongitude === "" || currentLongitude === null
          ? undefined
          : Number(currentLongitude);
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "AVAILABLE",
        "ASSIGNED",
        "ON_ROUTE",
        "COLLECTING",
        "MAINTENANCE",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid vehicle status",
        });
      }

      vehicle.status = status;
    }

    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("villageId", "name district state")
      .populate("driverId");

    return res.json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Vehicle number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Vehicle validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Unable to update vehicle",
      error: error.message,
    });
  }
});

/*
  DELETE VEHICLE
  DELETE /api/vehicles/:id
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
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

    return res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    return res.status(500).json({
      message: "Unable to delete vehicle",
      error: error.message,
    });
  }
});

module.exports = router;