import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";

import api from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const STATUS_STEPS = [
  {
    key: "REPORTED",
    label: "Reported",
    description:
      "Your waste report has been submitted.",
  },
  {
    key: "AI_VERIFIED",
    label: "AI Verified",
    description:
      "The waste image has been analyzed.",
  },
  {
    key: "ADMIN_REVIEW",
    label: "Admin Review",
    description:
      "The report is being reviewed by the authority.",
  },
  {
    key: "VEHICLE_ASSIGNED",
    label: "Vehicle Assigned",
    description:
      "A collection vehicle has been assigned.",
  },
  {
    key: "IN_PROGRESS",
    label: "Collection In Progress",
    description:
      "The collection team is handling the waste.",
  },
  {
    key: "RESOLVED",
    label: "Resolved",
    description:
      "The waste has been successfully collected.",
  },
];

const DELETE_ALLOWED_STATUSES = [
  "REPORTED",
  "AI_VERIFIED",
  "REJECTED",
  "DUPLICATE",
];

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(`/reports/${id}`);

      setReport(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch report:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load report details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepState = (stepKey) => {
    if (!report) return "pending";

    const currentIndex =
      STATUS_STEPS.findIndex(
        (step) =>
          step.key === report.status
      );

    const stepIndex =
      STATUS_STEPS.findIndex(
        (step) =>
          step.key === stepKey
      );

    if (
      report.status === "REJECTED"
    ) {
      return "rejected";
    }

    if (
      report.status === "DUPLICATE"
    ) {
      return "duplicate";
    }

    if (stepIndex < currentIndex) {
      return "completed";
    }

    if (stepIndex === currentIndex) {
      return "current";
    }

    return "pending";
  };

  const getSeverityClass = (
    severity
  ) => {
    if (severity === "High") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (severity === "Medium") {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    return "bg-green-100 text-green-700 border-green-200";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(
      date
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const canDelete =
    report &&
    DELETE_ALLOWED_STATUSES.includes(
      report.status
    );

  const handleDelete = async () => {
    if (!report || !canDelete) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this waste report? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete(
        `/reports/${report._id}`
      );

      alert(
        "Waste report deleted successfully."
      );

      navigate(
        "/citizen/reports",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Delete report error:",
        error
      );

      setDeleteError(
        error.response?.data?.message ||
          "Unable to delete report. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2
            size={28}
            className="animate-spin text-emerald-600"
          />
          <span>
            Loading report...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <AlertTriangle
            size={40}
            className="mx-auto text-red-500 mb-4"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Unable to Load Report
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                "/citizen/reports"
              )
            }
            className="mt-6 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Back to My Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const isRejected =
    report.status === "REJECTED";

  const isDuplicate =
    report.status === "DUPLICATE";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <button
            onClick={() =>
              navigate(
                "/citizen/reports"
              )
            }
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft size={20} />
            Back to My Reports
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText
                size={24}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Report Details
              </h1>

              <p className="text-slate-500 mt-1">
                Track your waste collection request
              </p>
            </div>
          </div>
        </div>

        {deleteError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {deleteError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-100">
              <img
                src={
                  report.imageUrl?.startsWith("http")
                    ? report.imageUrl
                    : `${API_BASE_URL}${report.imageUrl}`
                }
                alt="Reported waste"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">
                  Report ID
                </p>

                <h2 className="text-xl font-bold text-slate-900">
                  {report.reportId ||
                    report._id}
                </h2>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                  isRejected
                    ? "bg-red-100 text-red-700 border-red-200"
                    : isDuplicate
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {report.status?.replaceAll(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-slate-500">
                  Waste Type
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {report.wasteType ||
                    "Other"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Severity
                </p>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full border text-sm font-semibold ${getSeverityClass(
                    report.severity
                  )}`}
                >
                  {report.severity ||
                    "Low"}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  AI Confidence
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {typeof report.aiConfidence ===
                    "number" &&
                  report.aiConfidence > 0
                    ? `${Math.round(
                        report.aiConfidence *
                          100
                      )}%`
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Reported On
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {formatDate(
                    report.createdAt
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Village
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {report.villageId?.name ||
                    "N/A"}
                </p>

                {report.villageId
                  ?.district && (
                  <p className="text-sm text-slate-500">
                    {
                      report.villageId
                        .district
                    }
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Location
                </p>

                <div className="flex items-center gap-1 mt-1 text-slate-700">
                  <MapPin
                    size={16}
                    className="text-emerald-600"
                  />

                  <span className="text-sm">
                    {report.latitude},{" "}
                    {report.longitude}
                  </span>
                </div>
              </div>
            </div>

            {report.description && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="text-slate-700 mt-1">
                  {report.description}
                </p>
              </div>
            )}

            {canDelete && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Report
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 mt-2">
                  You can delete this report because collection processing has not started.
                </p>
              </div>
            )}

            {!canDelete && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <AlertTriangle
                    size={20}
                    className="text-slate-500 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Report cannot be deleted
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Collection processing has already started or the report has been resolved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isRejected && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200">
            <div className="flex gap-3">
              <AlertTriangle
                className="text-red-600 shrink-0"
                size={24}
              />

              <div>
                <h3 className="font-bold text-red-800">
                  Report Rejected
                </h3>

                <p className="text-red-700 text-sm mt-1">
                  This report was rejected during the review process.
                </p>
              </div>
            </div>
          </div>
        )}

        {isDuplicate && (
          <div className="mb-8 p-5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="flex gap-3">
              <AlertTriangle
                className="text-yellow-600 shrink-0"
                size={24}
              />

              <div>
                <h3 className="font-bold text-yellow-800">
                  Duplicate Report
                </h3>

                <p className="text-yellow-700 text-sm mt-1">
                  This waste location has already been reported.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isRejected &&
          !isDuplicate && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Collection Tracking
                </h2>

                <p className="text-slate-500 mt-1">
                  Follow the progress of your report
                </p>
              </div>

              <div className="space-y-0">
                {STATUS_STEPS.map(
                  (step, index) => {
                    const state =
                      getStepState(
                        step.key
                      );

                    return (
                      <div
                        key={step.key}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          {state ===
                            "completed" ||
                          state ===
                            "current" ? (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                state ===
                                "current"
                                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                                  : "bg-emerald-100 text-emerald-600"
                              }`}
                            >
                              <CheckCircle
                                size={22}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                              <Circle
                                size={22}
                              />
                            </div>
                          )}

                          {index 
                            STATUS_STEPS.length -
                              1 && (
                            <div
                              className={`w-0.5 h-16 ${
                                state ===
                                "completed"
                                  ? "bg-emerald-300"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pb-8">
                          <h3
                            className={`font-semibold ${
                              state ===
                              "pending"
                                ? "text-slate-400"
                                : "text-slate-900"
                            }`}
                          >
                            {step.label}
                          </h3>

                          <p
                            className={`text-sm mt-1 ${
                              state ===
                              "pending"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {
                              step.description
                            }
                          </p>

                          {state ===
                            "current" && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600 font-medium">
                              <Clock
                                size={15}
                              />
                              Current status
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin
              size={22}
              className="text-emerald-600"
            />

            <h2 className="text-lg font-bold text-slate-900">
              Report Location
            </h2>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-500">
              Coordinates
            </p>

            <p className="font-medium text-slate-800 mt-1">
              Latitude:{" "}
              {report.latitude}
              <br />
              Longitude:{" "}
              {report.longitude}
            </p>

            {report.address && (
              <p className="text-sm text-slate-600 mt-3">
                {report.address}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportDetails;