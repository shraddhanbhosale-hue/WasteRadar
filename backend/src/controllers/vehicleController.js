const Vehicle = require("../models/Vehicle");

// ==========================================
// CREATE VEHICLE
// ==========================================
const createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      capacity,
      depotAddress,
      depotLatitude,
      depotLongitude,
      status,
    } = req.body;

    // Village comes from the logged-in admin
    const villageId = req.user.villageId;

    if (!vehicleNumber || !capacity) {
      return res.status(400).json({
        message: "Vehicle number and capacity are required",
      });
    }

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const existingVehicle = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.trim(),
    });

    if (existingVehicle) {
      return res.status(400).json({
        message: "Vehicle with this number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.trim(),
      vehicleType: vehicleType || "Garbage Truck",
      capacity: Number(capacity),
      villageId: villageId,
      depotAddress,
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
      status: status || "AVAILABLE",
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("villageId", "name district state")
      .populate("driverId", "name phone status");

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle: populatedVehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    return res.status(500).json({
      message: "Unable to create vehicle",
    });
  }
};

// ==========================================
// GET ALL VEHICLES
// ==========================================
const getVehicles = async (req, res) => {
  try {
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const vehicles = await Vehicle.find({
      villageId,
    })
      .populate("villageId", "name district state")
      .populate("driverId", "name phone status")
      .sort({ createdAt: -1 });

    return res.json({
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      message: "Unable to load vehicles",
    });
  }
};

// ==========================================
// GET VEHICLE BY ID
// ==========================================
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: id,
      villageId,
    })
      .populate("villageId", "name district state")
      .populate("driverId", "name phone status");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.json({
      vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      message: "Unable to load vehicle",
    });
  }
};

// ==========================================
// UPDATE VEHICLE
// ==========================================
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      vehicleNumber,
      vehicleType,
      capacity,
      depotAddress,
      depotLatitude,
      depotLongitude,
      status,
    } = req.body;

    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: id,
      villageId,
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicleNumber !== undefined) {
      const trimmedVehicleNumber =
        vehicleNumber.trim();

      const existingVehicle = await Vehicle.findOne({
        vehicleNumber: trimmedVehicleNumber,
        _id: { $ne: id },
      });

      if (existingVehicle) {
        return res.status(400).json({
          message: "Vehicle with this number already exists",
        });
      }

      vehicle.vehicleNumber =
        trimmedVehicleNumber;
    }

    if (vehicleType !== undefined) {
      vehicle.vehicleType = vehicleType;
    }

    if (capacity !== undefined) {
      vehicle.capacity = Number(capacity);
    }

    if (depotAddress !== undefined) {
      vehicle.depotAddress = depotAddress;
    }

    if (depotLatitude !== undefined) {
      vehicle.depotLatitude =
        depotLatitude === "" ||
        depotLatitude === null
          ? undefined
          : Number(depotLatitude);
    }

    if (depotLongitude !== undefined) {
      vehicle.depotLongitude =
        depotLongitude === "" ||
        depotLongitude === null
          ? undefined
          : Number(depotLongitude);
    }

    if (status !== undefined) {
      vehicle.status = status;
    }

    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(
      vehicle._id
    )
      .populate("villageId", "name district state")
      .populate("driverId", "name phone status");

    return res.json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    return res.status(500).json({
      message: "Unable to update vehicle",
    });
  }
};

// ==========================================
// DELETE VEHICLE
// ==========================================
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const villageId = req.user.villageId;

    if (!villageId) {
      return res.status(400).json({
        message: "Admin is not assigned to a village",
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: id,
      villageId,
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.driverId) {
      return res.status(400).json({
        message:
          "Vehicle assigned to a driver cannot be deleted",
      });
    }

    if (
      vehicle.status !== "AVAILABLE" &&
      vehicle.status !== "MAINTENANCE"
    ) {
      return res.status(400).json({
        message:
          "Vehicle cannot be deleted while it is active",
      });
    }

    await vehicle.deleteOne();

    return res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    return res.status(500).json({
      message: "Unable to delete vehicle",
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};