const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const analyzeWasteImage = async (filename) => {
  try {
    const formData = new FormData();

    const imagePath = path.join(
      __dirname,
      "../../uploads",
      filename
    );

    formData.append(
      "image",
      fs.createReadStream(imagePath)
    );

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/ai/analyze`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to connect to AI service.");
  }
};

module.exports = {
  analyzeWasteImage,
};