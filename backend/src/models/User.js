const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Password is optional because Google users
    // authenticate through Google instead of a password.
    password: {
      type: String,
      required: false,
      default: null,
    },

    role: {
      type: String,
      enum: ["CITIZEN", "ADMIN", "DRIVER"],
      default: "CITIZEN",
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
    },

    // Google account information
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);