const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Image upload error:", error.message);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
});

module.exports = router;