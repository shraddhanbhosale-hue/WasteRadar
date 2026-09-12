const mongoose = require("mongoose");

const wasteReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },

    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WasteIncident",
      default: null,
    },

    vehicleId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Vehicle",
  default: null,
},

    imageUrl: {
      type: String,
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

    description: {
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

    aiConfidence: {
      type: Number,
      default: 0,
    },

    wasteDetected: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "AI_VERIFIED",
        "ADMIN_REVIEW",
        "VEHICLE_ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
        "DUPLICATE",
      ],
      default: "REPORTED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WasteReport", wasteReportSchema);