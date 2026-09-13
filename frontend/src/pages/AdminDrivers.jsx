import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Truck,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminDrivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicleId: "",
    status: "AVAILABLE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("wasteradar_token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [driversRes, vehiclesRes] = await Promise.all([
        fetch(`${API_URL}/drivers`, {
          headers,
        }),
        fetch(`${API_URL}/vehicles`, {
          headers,
        }),
      ]);

      const driversData = await driversRes.json();
      const vehiclesData = await vehiclesRes.json();

      if (!driversRes.ok) {
        throw new Error(
          driversData.message || "Unable to load drivers"
        );
      }

      if (!vehiclesRes.ok) {
        throw new Error(
          vehiclesData.message || "Unable to load vehicles"
        );
      }

      setDrivers(driversData.drivers || []);
      setVehicles(vehiclesData.vehicles || []);
    } catch (err) {
      console.error(
        "Load driver management data error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleId: "",
      status: "AVAILABLE",
    });

    setEditingDriver(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!formData.name.trim()) {
        throw new Error("Driver name is required");
      }

      if (!editingDriver && !formData.email.trim()) {
        throw new Error("Driver email is required");
      }

      if (!editingDriver && !formData.password) {
        throw new Error("Driver password is required");
      }

      if (
        !editingDriver &&
        formData.password.length < 6
      ) {
        throw new Error(
          "Driver password must be at least 6 characters"
        );
      }

      if (!formData.vehicleId) {
        throw new Error(
          "Please assign a vehicle to the driver"
        );
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        vehicleId: formData.vehicleId,
        status: formData.status,
      };

      let response;

      if (editingDriver) {
        response = await fetch(
          `${API_URL}/drivers/${editingDriver._id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(`${API_URL}/drivers`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save driver"
        );
      }

      await loadData();
      resetForm();
    } catch (err) {
      console.error("Save driver error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);

    setFormData({
      name: driver.name || "",
      email: driver.userId?.email || "",
      password: "",
      phone:
        driver.phone ||
        driver.userId?.phone ||
        "",
      vehicleId: driver.vehicleId?._id || "",
      status: driver.status || "AVAILABLE",
    });

    setShowForm(true);
    setError("");
  };

  const handleDelete = async (driverId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this driver?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/drivers/${driverId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete driver"
        );
      }

      await loadData();
    } catch (err) {
      console.error("Delete driver error:", err);
      setError(err.message);
    }
  };

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "AVAILABLE" ||
      vehicle._id === formData.vehicleId
  );

  const totalDrivers = drivers.length;

  const availableDrivers = drivers.filter(
    (driver) => driver.status === "AVAILABLE"
  ).length;

  const onTaskDrivers = drivers.filter(
    (driver) => driver.status === "ON_TASK"
  ).length;

  const offlineDrivers = drivers.filter(
    (driver) => driver.status === "OFFLINE"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Driver Management
              </h1>

              <p className="mt-1 text-slate-500">
                Manage waste collection drivers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={20} />
            Add Driver
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Users className="text-blue-600" size={24} />

              <span className="text-3xl font-bold text-slate-900">
                {totalDrivers}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              Total Drivers
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <UserCheck
                className="text-emerald-600"
                size={24}
              />

              <span className="text-3xl font-bold text-slate-900">
                {availableDrivers}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              Available
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Truck
                className="text-orange-600"
                size={24}
              />

              <span className="text-3xl font-bold text-slate-900">
                {onTaskDrivers}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              On Task
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Users
                className="text-slate-500"
                size={24}
              />

              <span className="text-3xl font-bold text-slate-900">
                {offlineDrivers}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              Offline
            </p>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDriver
                  ? "Edit Driver"
                  : "Add New Driver"}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Driver Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Driver name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required={!editingDriver}
                  disabled={!!editingDriver}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
                  placeholder="driver@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {editingDriver
                    ? "New Password (optional)"
                    : "Password"}
                </label>

                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required={!editingDriver}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder={
                    editingDriver
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone
                </label>

                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Assign Vehicle
                </label>

                <select
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicleId: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">
                    Select vehicle
                  </option>

                  {availableVehicles.map((vehicle) => (
                    <option
                      key={vehicle._id}
                      value={vehicle._id}
                    >
                      {vehicle.vehicleNumber}
                      {vehicle.vehicleType
                        ? ` — ${vehicle.vehicleType}`
                        : ""}
                    </option>
                  ))}
                </select>

                {availableVehicles.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No available vehicles. Create an available
                    vehicle first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="AVAILABLE">
                    Available
                  </option>

                  <option value="OFFLINE">
                    Offline
                  </option>

                  <option value="ON_TASK">
                    On Task
                  </option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    availableVehicles.length === 0
                  }
                  className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingDriver
                    ? "Update Driver"
                    : "Create Driver"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Drivers
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center">
              <Users
                size={48}
                className="mx-auto mb-4 text-slate-300"
              />

              <h3 className="text-lg font-semibold text-slate-700">
                No drivers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first waste collection driver.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Driver
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {drivers.map((driver) => (
                    <tr
                      key={driver._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {driver.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {driver.userId?.email || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {driver.phone ||
                          driver.userId?.phone ||
                          "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {driver.vehicleId?.vehicleNumber ||
                          "Not assigned"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            driver.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-700"
                              : driver.status === "ON_TASK"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {driver.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleEdit(driver)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit driver"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(driver._id)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50"
                            title="Delete driver"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDrivers;