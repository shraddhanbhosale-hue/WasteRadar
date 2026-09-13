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
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    phone: "",
    vehicleId: "",
    status: "OFFLINE",
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

      const [driversRes, usersRes, vehiclesRes] =
        await Promise.all([
          fetch(`${API_URL}/drivers`, {
            headers,
          }),
          fetch(`${API_URL}/auth/users`, {
            headers,
          }),
          fetch(`${API_URL}/vehicles`, {
            headers,
          }),
        ]);

      const driversData = await driversRes.json();
      const usersData = await usersRes.json();
      const vehiclesData = await vehiclesRes.json();

      if (!driversRes.ok) {
        throw new Error(
          driversData.message || "Unable to load drivers"
        );
      }

      if (!usersRes.ok) {
        throw new Error(
          usersData.message || "Unable to load users"
        );
      }

      if (!vehiclesRes.ok) {
        throw new Error(
          vehiclesData.message || "Unable to load vehicles"
        );
      }

      setDrivers(driversData.drivers || []);

      const citizenUsers = (usersData.users || []).filter(
        (user) => user.role === "CITIZEN"
      );

      setUsers(citizenUsers);

      setVehicles(vehiclesData.vehicles || []);
    } catch (err) {
      console.error("Load driver management data error:", err);
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
      userId: "",
      name: "",
      phone: "",
      vehicleId: "",
      status: "OFFLINE",
    });

    setEditingDriver(null);
    setShowForm(false);
    setError("");
  };

  const handleUserChange = (userId) => {
    const selectedUser = users.find(
      (user) => user._id === userId
    );

    setFormData((prev) => ({
      ...prev,
      userId,
      name: selectedUser?.name || "",
      phone: selectedUser?.phone || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!editingDriver && !formData.userId) {
        throw new Error("Please select a citizen user");
      }

      if (!formData.name.trim()) {
        throw new Error("Driver name is required");
      }

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      };

      let response;

      if (editingDriver) {
        payload.vehicleId = formData.vehicleId || null;

        response = await fetch(
          `${API_URL}/drivers/${editingDriver._id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          }
        );
      } else {
        payload.userId = formData.userId;

        if (formData.vehicleId) {
          payload.vehicleId = formData.vehicleId;
        }

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
      userId: driver.userId?._id || "",
      name: driver.name || "",
      phone:
        driver.phone ||
        driver.userId?.phone ||
        "",
      vehicleId: driver.vehicleId?._id || "",
      status: driver.status || "OFFLINE",
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

        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
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

        {/* Form */}
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

              {/* Citizen User */}
              {!editingDriver && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Citizen User
                  </label>

                  <select
                    value={formData.userId}
                    onChange={(e) =>
                      handleUserChange(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Select citizen
                    </option>

                    {users.length === 0 ? (
                      <option value="" disabled>
                        No citizen users available
                      </option>
                    ) : (
                      users.map((user) => (
                        <option
                          key={user._id}
                          value={user._id}
                        >
                          {user.name} — {user.email}
                        </option>
                      ))
                    )}
                  </select>

                  {users.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      No CITIZEN users found. Register a citizen
                      account first.
                    </p>
                  )}
                </div>
              )}

              {/* Name */}
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

              {/* Phone */}
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

              {/* Vehicle */}
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">
                    No vehicle
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
                  <p className="mt-2 text-xs text-slate-500">
                    No available vehicles.
                  </p>
                )}
              </div>

              {/* Status */}
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
                  <option value="OFFLINE">
                    Offline
                  </option>

                  <option value="AVAILABLE">
                    Available
                  </option>

                  <option value="ON_TASK">
                    On Task
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    (!editingDriver && users.length === 0)
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

        {/* Drivers Table */}
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
              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Driver
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Village
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
                        {driver.villageId?.name || "-"}
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