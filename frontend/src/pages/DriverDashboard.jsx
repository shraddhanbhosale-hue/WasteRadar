import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Recycle,
  Truck,
  MapPin,
  Loader2,
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  LogOut,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";

function DriverDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // ==========================================
  // GET LOGGED-IN USER (for greeting)
  // ==========================================

  const getUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("wasteradar_user")
      );
    } catch {
      return null;
    }
  };

  const user = getUser();

  // ==========================================
  // FETCH DRIVER TASKS
  // ==========================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/driver/tasks");

      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Fetch driver tasks error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ==========================================
  // START COLLECTION
  // ==========================================

  const handleStart = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      setError("");
      setSuccess("");

      await api.put(`/driver/tasks/${taskId}/start`);

      setSuccess("Collection started successfully.");

      await fetchTasks();
    } catch (error) {
      console.error("Start task error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to start collection."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ==========================================
  // MARK AS COLLECTED
  // ==========================================

  const handleComplete = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      setError("");
      setSuccess("");

      await api.put(`/driver/tasks/${taskId}/complete`);

      setSuccess("Waste collection marked as completed.");

      await fetchTasks();
    } catch (error) {
      console.error("Complete task error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to complete collection."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("wasteradar_token");
    localStorage.removeItem("wasteradar_user");
    navigate("/login");
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    if (status === "VEHICLE_ASSIGNED") return "Assigned";
    if (status === "IN_PROGRESS") return "In Progress";
    return status;
  };

  const getStatusStyle = (status) => {
    if (status === "IN_PROGRESS") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const assignedCount = tasks.filter(
    (task) => task.status === "VEHICLE_ASSIGNED"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          NAVBAR
      ========================================= */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center">
              <Recycle size={20} />
            </div>

            <span className="font-bold text-slate-900">
              WasteRadar
            </span>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </header>

      {/* ========================================
          MAIN
      ========================================= */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>

            <p className="text-sm font-semibold text-green-700">
              DRIVER
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Welcome, {user?.name || "Driver"} 👋
            </h1>

            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              View and manage your assigned waste collection tasks.
            </p>

          </div>

          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold self-start"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
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

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* ========================================
            SUMMARY CARDS
        ========================================= */}

        <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardList size={22} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Assigned
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {assignedCount}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck size={22} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {inProgressCount}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================
            TASKS LIST
        ========================================= */}

        {loading ? (

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-14 text-center">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-green-700"
            />

            <p className="mt-4 text-slate-500">
              Loading your tasks...
            </p>

          </div>

        ) : tasks.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-14 text-center">

            <Truck
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="font-bold text-slate-800 mt-4">
              No tasks assigned
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              New collection tasks will appear here once an admin assigns a vehicle to you.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {tasks.map((task) => (

              <div
                key={task._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
              >

                {/* TOP ROW */}

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="font-semibold text-slate-900 truncate">
                      {task.reportId || task._id}
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(task.createdAt)}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>

                </div>

                {/* DETAILS */}

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Waste Type
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {task.wasteType || "Other"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Severity
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {task.severity || "Low"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Village
                    </p>
                    <p className="text-sm text-slate-700 mt-1 flex items-center gap-1">
                      <MapPin size={14} className="text-green-700" />
                      {task.villageId?.name || "Unknown"}
                    </p>
                  </div>

                  {task.address && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        Address
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {task.address}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Reported By
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {task.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {task.userId?.phone || task.userId?.email || ""}
                    </p>
                  </div>

                </div>

                {/* ACTION BUTTON */}

                <div className="mt-5">

                  {task.status === "VEHICLE_ASSIGNED" && (
                    <button
                      onClick={() => handleStart(task._id)}
                      disabled={actionLoadingId === task._id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold transition"
                    >
                      {actionLoadingId === task._id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <PlayCircle size={18} />
                      )}
                      Start Collection
                    </button>
                  )}

                  {task.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleComplete(task._id)}
                      disabled={actionLoadingId === task._id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition"
                    >
                      {actionLoadingId === task._id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Mark as Collected
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default DriverDashboard;
