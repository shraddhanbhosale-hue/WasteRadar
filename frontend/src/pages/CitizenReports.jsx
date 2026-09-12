import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Recycle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CitizenReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports");

      console.log("Citizen reports:", response.data);

      setReports(
        response.data.reports ||
          response.data ||
          []
      );
    } catch (error) {
      console.error("Fetch reports error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
      case "COLLECTED":
        return "bg-green-100 text-green-700";

      case "APPROVED":
      case "ASSIGNED":
      case "VEHICLE_ASSIGNED":
        return "bg-blue-100 text-blue-700";

      case "REPORTED":
      case "AI_VERIFIED":
      case "ADMIN_REVIEW":
      case "IN_PROGRESS":
      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "DUPLICATE":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
      case "COLLECTED":
        return <CheckCircle2 size={15} />;

      case "REJECTED":
        return <XCircle size={15} />;

      default:
        return <Clock3 size={15} />;
    }
  };

  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() => navigate("/citizen")}
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

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold text-green-700">
              MY REPORTS
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Waste Reports
            </h1>

            <p className="text-slate-500 mt-2">
              Track the status of waste reported by you.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              onClick={() =>
                navigate("/citizen/report")
              }
              className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-sm"
            >
              + Report Waste
            </button>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center">

            <Loader2
              size={32}
              className="animate-spin text-green-700"
            />

            <p className="mt-4 text-slate-500">
              Loading your reports...
            </p>

          </div>

        ) : reports.length === 0 ? (

          /* EMPTY */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
              <Recycle size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              No reports yet
            </h2>

            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              You haven't submitted any waste reports.
              Report waste in your area to help keep your
              community clean.
            </p>

            <button
              onClick={() =>
                navigate("/citizen/report")
              }
              className="mt-6 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold"
            >
              Report Your First Waste
            </button>

          </div>

        ) : (

          /* REPORT LIST */
          <div className="space-y-4">

            {reports.map((report) => (

              <div
                key={report._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >

                <div className="flex flex-col md:flex-row gap-5">

                  {/* IMAGE */}
                  <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">

                    {report.imageUrl ? (
                      <img
                        src={
                          report.imageUrl.startsWith("http")
                            ? report.imageUrl
                            : `http://localhost:5000${report.imageUrl}`
                        }
                        alt="Reported waste"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Recycle size={30} />
                      </div>
                    )}

                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div>
                        <p className="text-xs text-slate-400">
                          Report ID
                        </p>

                        <h3 className="font-bold text-slate-900 mt-1">
                          {report.reportId ||
                            report._id}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(report.status)}
                        {formatStatus(report.status)}
                      </span>

                    </div>

                    {/* DETAILS */}
                    <div className="grid sm:grid-cols-3 gap-4 mt-5">

                      <div>
                        <p className="text-xs text-slate-400">
                          Waste Type
                        </p>

                        <p className="text-sm font-semibold text-slate-800 mt-1">
                          {report.wasteType ||
                            "Other"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Severity
                        </p>

                        <p className="text-sm font-semibold text-slate-800 mt-1">
                          {report.severity ||
                            "Medium"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Reported On
                        </p>

                        <p className="text-sm font-semibold text-slate-800 mt-1">
                          {formatDate(
                            report.createdAt
                          )}
                        </p>
                      </div>

                    </div>

                    {/* LOCATION */}
                    {(report.latitude !== undefined ||
                      report.location?.latitude) && (
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                        <MapPin
                          size={15}
                          className="text-green-700"
                        />

                        Location captured
                      </div>
                    )}

                    {/* DESCRIPTION */}
                    {report.description && (
                      <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">

                      <button
                        onClick={() =>
                          navigate(
                            `/citizen/reports/${report._id}`
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                      >
                        <Eye size={17} />
                        View Details
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default CitizenReports;
