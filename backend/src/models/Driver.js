const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "ON_TASK", "OFFLINE"],
      default: "OFFLINE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Driver", driverSchema);