const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const driverRoutes = require("./src/routes/driverRoutes");
require("dotenv").config();

// ==========================================
// ROUTES
// ==========================================
const authRoutes = require("./src/routes/authRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const driverRoutes = require("./src/routes/driverRoutes");
const driverTaskRoutes = require("./src/routes/driverTaskRoutes");
const vehicleRoutes = require("./src/routes/vehicleRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const villageRoutes = require("./src/routes/villageRoutes");
const driverManagementRoutes = require("./src/routes/driverManagementRoutes");

// ==========================================
// MIDDLEWARE
// ==========================================
const protect = require("./src/middleware/authMiddleware");

// ==========================================
// REGISTER MODELS
// ==========================================
require("./src/models/Village");
require("./src/models/User");
require("./src/models/Vehicle");
require("./src/models/Driver");
require("./src/models/WasteReport");

// ==========================================
// EXPRESS APP
// ==========================================
const app = express();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

// Citizen Waste Reports
app.use("/api/reports", reportRoutes);

// Image Upload
app.use("/api/upload", uploadRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Vehicle Management
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/villages", villageRoutes);

// Driver Management
app.use("/api/drivers", driverManagementRoutes);

// Driver Tasks
app.use("/api/driver", driverTaskRoutes);

// AI Analysis
app.use("/api/ai", aiRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.json({
    message: "WasteRadar Backend is running 🚀",
    status: "healthy",
  });
});

// ==========================================
// PROTECTED TEST ROUTE
// ==========================================
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message:
      "You accessed a protected route successfully! 🔐",
    user: req.user,
  });
});

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully ✅"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed ❌",
      error.message
    );
  });

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `WasteRadar Backend running on port ${PORT}`
  );
});