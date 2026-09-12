const WasteReport = require("../models/WasteReport");
const fs = require("fs");
const path = require("path");

const {
  analyzeWasteImage,
} = require("../services/aiService");

const DELETE_ALLOWED_STATUSES = [
  "REPORTED",
  "AI_VERIFIED",
  "REJECTED",
  "DUPLICATE",
];

const createReport = async (req, res) => {
  try {
    const {
      villageId,
      latitude,
      longitude,
      address,
      description,
      wasteType,
      severity,
    } = req.body;

    if (
      !villageId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Village and location are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Waste image is required",
      });
    }

    let aiAnalysis = null;

    try {
      aiAnalysis = await analyzeWasteImage(
        req.file.filename
      );

      console.log(
        "AI analysis result:",
        aiAnalysis
      );
    } catch (aiError) {
      console.error(
        "AI analysis failed:",
        aiError.message
      );

      return res.status(503).json({
        message:
          "Unable to analyze image. Please try again.",
      });
    }

    if (!aiAnalysis) {
      return res.status(503).json({
        message:
          "AI service returned an empty response.",
      });
    }

    if (!aiAnalysis.wasteDetected) {
      return res.status(400).json({
        message:
          "This image does not appear to show waste. Please upload a clear photo showing the waste.",
        aiAnalysis,
      });
    }

    if (
      typeof aiAnalysis.confidence !== "number" ||
      aiAnalysis.confidence < 0.70
    ) {
      return res.status(400).json({
        message:
          "AI confidence is too low. Please upload a clearer image.",
        aiAnalysis,
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const finalWasteType =
      aiAnalysis.wasteType ||
      wasteType ||
      "Other";

    const aiConfidence = Number(
      aiAnalysis.confidence
    );

    const wasteDetected = Boolean(
      aiAnalysis.wasteDetected
    );

    const finalStatus = "AI_VERIFIED";

    const report = await WasteReport.create({
      reportId: `WR-${Date.now()}`,
      userId: req.user.userId,
      villageId,
      imageUrl,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
      description,
      wasteType: finalWasteType,
      severity:
        aiAnalysis.severity ||
        severity ||
        "Low",
      aiConfidence,
      wasteDetected,
      status: finalStatus,
    });

    res.status(201).json({
      message:
        "Waste report created successfully",
      report,
      aiAnalysis,
    });
  } catch (error) {
    console.error(
      "Create report error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      userId: req.user.userId,
    })
      .populate(
        "villageId",
        "name district state"
      )
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(
      "Get my reports error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch reports",
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(
      req.params.id
    )
      .populate(
        "villageId",
        "name district state"
      )
      .populate(
        "userId",
        "name email phone"
      );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (
      req.user.role === "CITIZEN" &&
      report.userId._id.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this report",
      });
    }

    res.json(report);
  } catch (error) {
    console.error(
      "Get report by ID error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to fetch report",
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WasteReport.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (
      req.user.role === "CITIZEN" &&
      report.userId.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can delete only your own reports",
      });
    }

    if (
      !DELETE_ALLOWED_STATUSES.includes(
        report.status
      )
    ) {
      return res.status(400).json({
        message:
          "This report cannot be deleted because collection processing has already started.",
      });
    }

    const imageUrl = report.imageUrl;

    await report.deleteOne();

    if (imageUrl) {
      const imagePath = path.join(
        __dirname,
        "../../",
        imageUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlink(
          imagePath,
          (error) => {
            if (error) {
              console.error(
                "Unable to delete report image:",
                error.message
              );
            }
          }
        );
      }
    }

    res.json({
      message:
        "Waste report deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete report error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to delete report",
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  deleteReport,
};