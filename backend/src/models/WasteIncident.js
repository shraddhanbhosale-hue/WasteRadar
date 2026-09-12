const mongoose = require("mongoose");

const wasteIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      unique: true,
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    wasteType: {
      type: String,
      enum: ["Plastic", "Organic", "Paper", "Mixed Waste", "Other"],
      default: "Other",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    reportCount: {
      type: Number,
      default: 1,
    },

    reportIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WasteReport",
      },
    ],

    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },

    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WasteIncident", wasteIncidentSchema);