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
  CheckCircle,
} from "lucide-react";

import api from "../services/api";

function DriverDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("wasteradar_user"));
    } catch {
      return null;
    }
  };

  const user = getUser();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/driver/tasks");

      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Fetch driver tasks error:", error);

      setError(
        error.response?.data?.message || "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
        error.response?.data?.message || "Unable to start collection."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("wasteradar_token");
    localStorage.removeItem("wasteradar_user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "VEHICLE_ASSIGNED":
        return "Assigned";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
        return "Completed";
      default:
        return status || "Unknown";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      case "VEHICLE_ASSIGNED":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const assignedCount = tasks.filter(
    (task) => task.status === "VEHICLE_ASSIGNED"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "RESOLVED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white">
              <Recycle size={20} />
            </div>

            <span className="font-bold text-slate-900">
              WasteRadar
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">
              DRIVER
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome, {user?.name || "Driver"} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              View and manage your assigned waste collection tasks.
            </p>
          </div>

          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ClipboardList size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Assigned</p>
                <p className="text-2xl font-bold text-slate-900">
                  {assignedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Completed</p>

                <p className="text-2xl font-bold text-slate-900">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-green-700"
            />

            <p className="mt-4 text-slate-500">
              Loading your tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <Truck
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-slate-800">
              No tasks assigned
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New collection tasks will appear here once an
              admin assigns a vehicle to you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {task.reportId || task._id}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(task.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Waste Type
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {task.wasteType || "Other"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Severity
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {task.severity || "Low"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Village
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-700">
                      <MapPin
                        size={14}
                        className="text-green-700"
                      />
                      {task.villageId?.name || "Unknown"}
                    </p>
                  </div>

                  {task.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {task.address}
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Reported By
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {task.userId?.name || "Unknown"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {task.userId?.phone ||
                        task.userId?.email ||
                        ""}
                    </p>
                  </div>

                  {task.vehicle && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Assigned Vehicle
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {task.vehicle.vehicleNumber} (
                        {task.vehicle.vehicleType})
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  {task.status === "VEHICLE_ASSIGNED" && (
                    <button
                      onClick={() => handleStart(task._id)}
                      disabled={actionLoadingId === task._id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400 sm:w-auto"
                    >
                      {actionLoadingId === task._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
                    >
                      {actionLoadingId === task._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}

                      Mark as Collected
                    </button>
                  )}

                  {task.status === "RESOLVED" && (
                    <div className="flex items-center gap-2 font-semibold text-green-700">
                      <CheckCircle2 size={18} />
                      Collection Completed
                    </div>
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