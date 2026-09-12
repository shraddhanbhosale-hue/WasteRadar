import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  RefreshCw,
  Recycle,
  Truck,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    vehicleAssigned: 0,
    inProgress: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    highSeverityReports: 0,
  });

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ADMIN DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, reportsResponse] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/reports"),
        ]);

      setStats(statsResponse.data);

      const reportData =
        reportsResponse.data.reports ||
        reportsResponse.data ||
        [];

      setReports(reportData);

    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            Loading admin dashboard...
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

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center">

              <Recycle size={22} />

            </div>

            <div>

              <h1 className="font-bold text-slate-900">
                WasteRadar
              </h1>

              <p className="text-xs text-slate-500">
                Administration Panel
              </p>

            </div>

          </div>

          {/* ADMIN */}

          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

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
              ADMIN CONTROL CENTER
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Dashboard
            </h2>

            <p className="text-slate-500 mt-2">
              Monitor and manage waste collection
              operations.
            </p>

          </div>

          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold"
          >

            <RefreshCw size={17} />

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
            STAT CARDS
        ========================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Reports
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.totalReports}
                </h3>

              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                <ClipboardList size={22} />
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Pending Review
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.pendingReports}
                </h3>

              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 size={22} />
              </div>

            </div>

          </div>

          {/* VEHICLE */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Vehicle Assigned
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.vehicleAssigned}
                </h3>

              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck size={22} />
              </div>

            </div>

          </div>

          {/* RESOLVED */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Resolved
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.resolvedReports}
                </h3>

              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* ========================================
            OPERATIONAL SUMMARY
        ========================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

          {/* IN PROGRESS */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Collection In Progress
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {stats.inProgress}
                </p>

              </div>

            </div>

          </div>

          {/* HIGH SEVERITY */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  High Severity
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {stats.highSeverityReports}
                </p>

              </div>

            </div>

          </div>

          {/* REJECTED */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Rejected
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {stats.rejectedReports}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================
            QUICK ACTIONS
        ========================================= */}

        <div className="mt-8">

          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* REPORTS */}

            <button
              onClick={() =>
                navigate("/admin/reports")
              }
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-green-300 hover:shadow-md transition group"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                  <ClipboardList size={22} />
                </div>

                <ArrowRight
                  size={19}
                  className="text-slate-400 group-hover:text-green-700 transition"
                />

              </div>

              <h4 className="font-bold text-slate-900 mt-4">
                Manage Reports
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Review, approve and manage waste
                reports.
              </p>

            </button>

            {/* VEHICLES */}

            <button
              onClick={() =>
                navigate("/admin/vehicles")
              }
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-green-300 hover:shadow-md transition group"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Truck size={22} />
                </div>

                <ArrowRight
                  size={19}
                  className="text-slate-400 group-hover:text-green-700 transition"
                />

              </div>

              <h4 className="font-bold text-slate-900 mt-4">
                Manage Vehicles
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Manage vehicles and collection
                assignments.
              </p>

            </button>

            {/* DRIVERS */}

            <button
              onClick={() =>
                navigate("/admin/drivers")
              }
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-green-300 hover:shadow-md transition group"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users size={22} />
                </div>

                <ArrowRight
                  size={19}
                  className="text-slate-400 group-hover:text-green-700 transition"
                />

              </div>

              <h4 className="font-bold text-slate-900 mt-4">
                Manage Drivers
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                View drivers and their collection
                tasks.
              </p>

            </button>

          </div>

        </div>

        {/* ========================================
            RECENT REPORTS
        ========================================= */}

        <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                Recent Reports
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Latest waste reports submitted by
                citizens.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/admin/reports")
              }
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              View All
            </button>

          </div>

          {reports.length === 0 ? (

            <div className="p-12 text-center">

              <ClipboardList
                size={40}
                className="mx-auto text-slate-300"
              />

              <h4 className="font-semibold text-slate-700 mt-4">
                No reports yet
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Waste reports will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

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
                      Severity
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {reports
                    .slice(0, 5)
                    .map((report) => (

                      <tr
                        key={report._id}
                        className="hover:bg-slate-50 transition"
                      >

                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/reports/${report._id}`
                              )
                            }
                            className="text-left"
                          >

                            <p className="font-semibold text-slate-900 hover:text-green-700">
                              {report.reportId ||
                                report._id}
                            </p>

                            <p className="text-xs text-slate-500">
                              {report.wasteType ||
                                "Other"}
                            </p>

                          </button>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-slate-800">
                            {report.userId?.name ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {report.userId?.email ||
                              ""}
                          </p>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-sm text-slate-700">
                            {report.villageId?.name ||
                              "Unknown"}
                          </p>

                        </td>

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

                        <td className="px-6 py-4">

                          <p className="text-sm text-slate-600">
                            {formatDate(
                              report.createdAt
                            )}
                          </p>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
