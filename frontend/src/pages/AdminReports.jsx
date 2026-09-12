import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  Loader2,
  RefreshCw,
  Recycle,
  Search,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH ALL REPORTS
  // ==========================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/reports"
      );

      const data =
        response.data.reports ||
        response.data ||
        [];

      setReports(data);
    } catch (error) {
      console.error(
        "Admin reports error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchReports();
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-700";

      case "VEHICLE_ASSIGNED":
        return "bg-blue-100 text-blue-700";

      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "AI_VERIFIED":
      case "ADMIN_REVIEW":
      case "REPORTED":
        return "bg-amber-100 text-amber-700";

      case "DUPLICATE":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ==========================================
  // FILTER REPORTS
  // ==========================================

  const filteredReports = reports.filter(
    (report) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        report.reportId
          ?.toLowerCase()
          .includes(query) ||
        report.userId?.name
          ?.toLowerCase()
          .includes(query) ||
        report.userId?.email
          ?.toLowerCase()
          .includes(query) ||
        report.villageId?.name
          ?.toLowerCase()
          .includes(query) ||
        report.wasteType
          ?.toLowerCase()
          .includes(query) ||
        report.status
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="flex flex-col items-center">

          <Loader2
            size={40}
            className="animate-spin text-green-700"
          />

          <p className="mt-4 text-slate-500">
            Loading reports...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          NAVBAR
      ========================================= */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() =>
              navigate("/admin")
            }
            className="flex items-center gap-2 text-slate-600 hover:text-green-700 transition"
          >
            <ArrowLeft size={20} />
            Dashboard
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

      {/* ========================================
          MAIN
      ========================================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <p className="text-sm font-semibold text-green-700">
              ADMIN
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Waste Reports
            </h1>

            <p className="text-slate-500 mt-2">
              Review and manage reports submitted
              by citizens.
            </p>

          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold"
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

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ========================================
            SUMMARY
        ========================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                <ClipboardList size={22} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Total Reports
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {reports.length}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  High Severity
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {
                    reports.filter(
                      (report) =>
                        report.severity ===
                        "High"
                    ).length
                  }
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardList size={22} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {
                    reports.filter(
                      (report) =>
                        [
                          "REPORTED",
                          "AI_VERIFIED",
                          "ADMIN_REVIEW",
                        ].includes(
                          report.status
                        )
                    ).length
                  }
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================
            SEARCH
        ========================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search report ID, citizen, village, waste type or status..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm"
            />

          </div>

        </div>

        {/* ========================================
            REPORT TABLE
        ========================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {filteredReports.length === 0 ? (

            <div className="p-14 text-center">

              <ClipboardList
                size={45}
                className="mx-auto text-slate-300"
              />

              <h3 className="font-bold text-slate-800 mt-4">
                No reports found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Report
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Citizen
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Village
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Waste
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Severity
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Date
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredReports.map(
                    (report) => (

                      <tr
                        key={report._id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* REPORT */}

                        <td className="px-6 py-4">

                          <p className="font-semibold text-slate-900">
                            {report.reportId ||
                              report._id}
                          </p>

                          <p className="text-xs text-slate-500">
                            {report.description
                              ? report.description.slice(
                                  0,
                                  35
                                ) +
                                (report.description
                                  .length > 35
                                  ? "..."
                                  : "")
                              : "No description"}
                          </p>

                        </td>

                        {/* CITIZEN */}

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {report.userId?.name ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {report.userId?.email ||
                              "-"}
                          </p>

                        </td>

                        {/* VILLAGE */}

                        <td className="px-6 py-4">

                          <p className="text-sm text-slate-700">
                            {report.villageId?.name ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {report.villageId
                              ?.district || ""}
                          </p>

                        </td>

                        {/* WASTE */}

                        <td className="px-6 py-4">

                          <span className="text-sm font-medium text-slate-700">
                            {report.wasteType ||
                              "Other"}
                          </span>

                        </td>

                        {/* SEVERITY */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              report.severity ===
                              "High"
                                ? "bg-red-100 text-red-700"
                                : report.severity ===
                                  "Medium"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {report.severity ||
                              "Low"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              report.status
                            )}`}
                          >
                            {formatStatus(
                              report.status
                            )}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4">

                          <span className="text-sm text-slate-600">
                            {formatDate(
                              report.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4 text-right">

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/reports/${report._id}`
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                          >

                            <Eye size={15} />

                            View

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminReports;
