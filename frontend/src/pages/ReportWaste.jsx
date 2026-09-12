import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Recycle,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ReportWaste() {
  const navigate = useNavigate();

  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [nearestVillage, setNearestVillage] =
    useState(null);

  const [villageLoading, setVillageLoading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [analysis, setAnalysis] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // IMAGE HANDLER
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image size must be less than 10MB."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const newPreview =
      URL.createObjectURL(file);

    setImage(file);
    setPreview(newPreview);

    setAnalysis(null);
    setError("");
    setSuccess("");

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setAnalysis(null);
    setError("");
    setSuccess("");

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  // ==========================================
  // START CAMERA
  // ==========================================

  const openCamera = async () => {
    setError("");
    setSuccess("");
    setCameraLoading(true);

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Camera is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      cameraStreamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          videoRef.current.play().catch(
            () => {}
          );
        }
      }, 100);
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Please allow camera access in your browser."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        setError(
          "No camera was found on this device."
        );
      } else {
        setError(
          "Unable to access the camera. Please check your camera permissions."
        );
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // ==========================================
  // TAKE PHOTO
  // ==========================================

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera is not ready yet. Please try again."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(
            "Unable to capture photo."
          );
          return;
        }

        const file = new File(
          [blob],
          `waste-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        if (preview) {
          URL.revokeObjectURL(preview);
        }

        const newPreview =
          URL.createObjectURL(file);

        setImage(file);
        setPreview(newPreview);
        setAnalysis(null);
        setError("");
        setSuccess("");

        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // ==========================================
  // CLEAN CAMERA ON UNMOUNT
  // ==========================================

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  // ==========================================
  // GET LOCATION
  // ==========================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setError("");
    setNearestVillage(null);
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);

        findNearestVillage(
          latitude,
          longitude
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        setError(
          "Unable to get your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // FIND NEAREST VILLAGE
  // ==========================================

  const findNearestVillage = async (
    latitude,
    longitude
  ) => {
    setVillageLoading(true);

    try {
      const response = await api.get(
        "/villages/nearest",
        {
          params: {
            latitude,
            longitude,
          },
        }
      );

      if (!response.data?.village) {
        setError(
          "Unable to determine your nearest village."
        );
        return;
      }

      setNearestVillage(
        response.data.village
      );
    } catch (error) {
      console.error(
        "Nearest village error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to determine your nearest village."
      );
    } finally {
      setVillageLoading(false);
    }
  };

  // ==========================================
  // AI ANALYSIS
  // ==========================================

  const handleAnalyze = async () => {
    if (!image) {
      setError(
        "Please upload a waste image first."
      );
      return;
    }

    setError("");
    setSuccess("");
    setAnalysis(null);
    setAnalyzing(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        image
      );

      const response =
        await api.post(
          "/ai/analyze",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const aiResult =
        response.data;

      if (!aiResult) {
        setError(
          "AI service returned an empty response."
        );
        return;
      }

      setAnalysis(aiResult);

      if (!aiResult.wasteDetected) {
        setError(
          "This image doesn't appear to show waste. Please upload a clear photo showing the waste."
        );
        return;
      }

      if (
        typeof aiResult.confidence !==
          "number" ||
        aiResult.confidence < 0.7
      ) {
        setError(
          "AI confidence is too low. Please upload a clearer image."
        );
        return;
      }

      setSuccess(
        "Waste detected successfully. You can submit the report."
      );
    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Unable to analyze image. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ==========================================
  // SUBMIT REPORT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError(
        "User session not found. Please login again."
      );
      return;
    }

    if (!image) {
      setError(
        "Please upload a waste image."
      );
      return;
    }

    if (!location) {
      setError(
        "Please get your current location before submitting."
      );
      return;
    }

    if (!nearestVillage?._id) {
      setError(
        "Unable to determine your village. Please update your location and try again."
      );
      return;
    }

    if (!analysis) {
      setError(
        "Please analyze the image before submitting."
      );
      return;
    }

    if (!analysis.wasteDetected) {
      setError(
        "No waste was detected in the image. Please upload a clearer waste image."
      );
      return;
    }

    if (
      typeof analysis.confidence !==
        "number" ||
      analysis.confidence < 0.7
    ) {
      setError(
        "AI confidence is too low. Please upload a clearer image."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "villageId",
        String(
          nearestVillage._id
        )
      );

      formData.append(
        "latitude",
        String(
          location.latitude
        )
      );

      formData.append(
        "longitude",
        String(
          location.longitude
        )
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "image",
        image
      );

      const response =
        await api.post(
          "/reports",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log(
        "Report submitted:",
        response.data
      );

      setSuccess(
        "Waste report submitted successfully!"
      );

      setTimeout(() => {
        navigate(
          "/citizen/reports"
        );
      }, 1500);
    } catch (error) {
      console.error(
        "Report submission error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to submit report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const wasteType =
    analysis?.wasteType ||
    "Other";

  const severity =
    analysis?.severity ||
    "Low";

  const confidence =
    analysis?.confidence;

  const canSubmit =
    !submitting &&
    image &&
    location &&
    !villageLoading &&
    nearestVillage?._id &&
    analysis?.wasteDetected &&
    typeof confidence ===
      "number" &&
    confidence >= 0.7;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================
          NAVBAR
      ====================================== */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() =>
              navigate("/citizen")
            }
            className="flex items-center gap-2 text-slate-600 hover:text-green-700 transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center">
              <Recycle size={20} />
            </div>

            <span className="font-bold text-slate-900">
              WasteRadar
            </span>
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-green-700 mb-2">
            REPORT WASTE
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Report Waste in Your Area
          </h1>

          <p className="mt-2 text-slate-500">
            Upload a photo, provide your location and let WasteRadar analyze the waste.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            {/* =====================================
                IMAGE SECTION
            ====================================== */}

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                1. Upload Waste Photo
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Take a new photo or choose one from your gallery.
              </p>

              {!preview ? (
                <button
                  type="button"
                  onClick={() =>
                    galleryInputRef.current?.click()
                  }
                  className="w-full h-72 border-2 border-dashed border-slate-300 rounded-2xl hover:border-green-500 hover:bg-green-50/50 transition flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                    <Upload size={27} />
                  </div>

                  <p className="font-semibold text-slate-800">
                    Upload waste image
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Click here to choose from gallery
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    PNG, JPG or JPEG · Max 10MB
                  </p>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Waste preview"
                    className="w-full h-72 object-cover rounded-2xl"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* GALLERY INPUT */}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

              {/* CAMERA / GALLERY BUTTONS */}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    galleryInputRef.current?.click()
                  }
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
                >
                  <Upload size={18} />
                  Gallery
                </button>

                <button
                  type="button"
                  onClick={openCamera}
                  disabled={
                    cameraLoading
                  }
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition disabled:bg-slate-100"
                >
                  {cameraLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Camera
                    </>
                  )}
                </button>
              </div>

              {/* CAMERA MODAL */}

              {cameraOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Take Waste Photo
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          Position the waste clearly inside the camera.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          closeCamera
                        }
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                      >
                        <X size={19} />
                      </button>
                    </div>

                    <div className="bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-video object-cover"
                      />
                    </div>

                    <div className="p-5 flex gap-3">
                      <button
                        type="button"
                        onClick={
                          closeCamera
                        }
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          capturePhoto
                        }
                        className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold flex items-center justify-center gap-2"
                      >
                        <Camera
                          size={19}
                        />
                        Take Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* ANALYZE */}

              <button
                type="button"
                disabled={
                  !image ||
                  analyzing
                }
                onClick={
                  handleAnalyze
                }
                className="w-full mt-4 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-300 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Analyzing Waste...
                  </>
                ) : (
                  <>
                    <Recycle size={19} />
                    Analyze with AI
                  </>
                )}
              </button>
            </section>

            {/* =====================================
                LOCATION SECTION
            ====================================== */}

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                2. Waste Location
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Help the collection team find the exact location.
              </p>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                  <MapPin size={27} />
                </div>

                <h3 className="font-semibold text-slate-800">
                  Current Location
                </h3>

                {location ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2
                        size={18}
                      />

                      <span className="text-sm font-semibold">
                        Location captured
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Latitude:{" "}
                      {location.latitude.toFixed(
                        6
                      )}
                    </p>

                    <p className="text-xs text-slate-500">
                      Longitude:{" "}
                      {location.longitude.toFixed(
                        6
                      )}
                    </p>

                    {villageLoading ? (
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Detecting nearest village...
                      </div>
                    ) : nearestVillage ? (
                      <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                        <p className="text-xs text-green-700">
                          Detected Village
                        </p>

                        <p className="text-sm font-semibold text-green-800">
                          {
                            nearestVillage.name
                          }
                        </p>

                        <p className="text-xs text-green-700 mt-1">
                          {
                            nearestVillage.district
                          }
                          ,{" "}
                          {
                            nearestVillage.state
                          }
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">
                    Location has not been captured yet.
                  </p>
                )}

                <button
                  type="button"
                  onClick={
                    getLocation
                  }
                  disabled={
                    locationLoading ||
                    villageLoading
                  }
                  className="mt-5 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  {locationLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Getting Location...
                    </>
                  ) : villageLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Detecting Village...
                    </>
                  ) : (
                    <>
                      <MapPin
                        size={18}
                      />
                      {location
                        ? "Update Location"
                        : "Get My Location"}
                    </>
                  )}
                </button>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe the waste location or any useful information..."
                  className="w-full resize-none px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </section>
          </div>

          {/* =====================================
              AI RESULT
          ====================================== */}

          {analysis && (
            <section className="mt-6 bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <Recycle size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    AI Analysis Result
                  </h2>

                  <p className="text-sm text-slate-500">
                    WasteRadar AI analyzed your image.
                  </p>
                </div>
              </div>

              {!analysis.wasteDetected ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="font-semibold text-red-700">
                    No waste detected
                  </p>

                  <p className="text-sm text-red-600 mt-1">
                    Please upload a clear image containing visible waste.
                  </p>
                </div>
              ) : confidence <
                0.7 ? (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
                  <p className="font-semibold text-orange-700">
                    Low AI confidence
                  </p>

                  <p className="text-sm text-orange-600 mt-1">
                    Please upload a clearer image so the AI can identify the waste more accurately.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Waste Type
                    </p>

                    <p className="font-bold text-slate-900 mt-1">
                      {wasteType}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Severity
                    </p>

                    <p className="font-bold text-slate-900 mt-1">
                      {severity}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Confidence
                    </p>

                    <p className="font-bold text-slate-900 mt-1">
                      {Math.round(
                        confidence *
                          100
                      )}
                      %
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================
              SUBMIT
          ====================================== */}

          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h3 className="font-bold text-slate-900">
                Ready to submit?
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your report will be sent to the WasteRadar admin team.
              </p>

              {nearestVillage && (
                <p className="text-xs text-green-700 mt-2">
                  Report will be routed to{" "}
                  <span className="font-semibold">
                    {
                      nearestVillage.name
                    }
                  </span>{" "}
                  authority.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-7 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-300 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={19}
                  />
                  Submit Waste Report
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ReportWaste;