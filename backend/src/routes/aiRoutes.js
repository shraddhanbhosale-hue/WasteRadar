const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/analyze",
  upload.single("image"),
  async (req, res) => {
    try {
      // Check image
      if (!req.file) {
        return res.status(400).json({
          message: "Image file is required",
        });
      }

      const AI_SERVICE_URL =
        process.env.AI_SERVICE_URL ||
        "http://localhost:8000";

      console.log(
        "Sending image to AI service..."
      );

      // Create multipart form data
      const formData = new FormData();

      const imageBlob = new Blob(
        [req.file.buffer],
        {
          type: req.file.mimetype,
        }
      );

      formData.append(
        "image",
        imageBlob,
        req.file.originalname
      );

      // Send image to Python AI service
      const aiResponse = await fetch(
        `${AI_SERVICE_URL}/api/ai/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText =
        await aiResponse.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        data = {
          message: responseText,
        };
      }

      if (!aiResponse.ok) {
        console.error(
          "AI service error:",
          aiResponse.status,
          data
        );

        return res
          .status(aiResponse.status)
          .json(data);
      }

      console.log(
        "AI Analysis Result:",
        data
      );

      return res.json(data);

    } catch (error) {
      console.error(
        "AI proxy error:",
        error
      );

      return res.status(503).json({
        message:
          "Unable to connect to AI service.",
      });
    }
  }
);

module.exports = router;