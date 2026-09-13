const express = require("express");
const mongoose = require("mongoose");

const Village = require("../models/Village");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/*
  GET ALL VILLAGES
  Citizen can use this to select their village
*/
router.get("/", protect, async (req, res) => {
  try {
    const villages = await Village.find()
      .sort({ name: 1 })
      .select("_id name district state latitude longitude");

    res.json(villages);
  } catch (error) {
    console.error("Get villages error:", error);

    res.status(500).json({
      message: "Unable to fetch villages",
    });
  }
});

/*
  FIND NEAREST VILLAGE (ALL INDIA)
  Uses user's current latitude and longitude
*/
router.get("/nearest", protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const userLatitude = Number(latitude);
    const userLongitude = Number(longitude);

    if (
      Number.isNaN(userLatitude) ||
      Number.isNaN(userLongitude)
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    if (
      userLatitude < -90 ||
      userLatitude > 90 ||
      userLongitude < -180 ||
      userLongitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid location coordinates",
      });
    }

    // Search across all villages in the database (no district filter)
    const villages = await Village.find();

    if (!villages.length) {
      return res.status(404).json({
        message: "No villages found in database",
      });
    }

    let nearestVillage = null;
    let shortestDistance = Infinity;

    for (const village of villages) {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        village.latitude,
        village.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestVillage = village;
      }
    }

    res.json({
      message: "Nearest village detected successfully",
      village: nearestVillage,
      distanceKm: Number(shortestDistance.toFixed(2)),
      userLocation: {
        latitude: userLatitude,
        longitude: userLongitude,
      },
    });
  } catch (error) {
    console.error("Nearest village error:", error);

    res.status(500).json({
      message: "Unable to detect nearest village",
    });
  }
});

/*
  SELECT / UPDATE CITIZEN VILLAGE
*/
router.put("/select", protect, async (req, res) => {
  try {
    const { villageId } = req.body;

    if (!villageId) {
      return res.status(400).json({
        message: "Village ID is required",
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

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "CITIZEN") {
      return res.status(403).json({
        message: "Only citizens can select a village",
      });
    }

    user.villageId = village._id;
    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate("villageId", "name district state")
      .select("-password");

    res.json({
      message: "Village selected successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Select village error:", error);

    res.status(500).json({
      message: "Unable to select village",
    });
  }
});

module.exports = router;