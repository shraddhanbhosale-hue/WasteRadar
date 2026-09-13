
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    depotAddress: {
      type: String,
      trim: true,
    },

    depotLatitude: {
      type: Number,
    },

    depotLongitude: {
      type: Number,
    },

    currentLatitude: {
      type: Number,
    },

    currentLongitude: {
      type: Number,
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "ASSIGNED",
        "ON_ROUTE",
        "COLLECTING",
        "MAINTENANCE",
      ],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
