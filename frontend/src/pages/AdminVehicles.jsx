import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Truck,
  MapPin,
  User,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const AdminVehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "Garbage Truck",
    capacity: "",
    depotAddress: "",
    depotLatitude: "",
    depotLongitude: "",
    status: "AVAILABLE",
  });

  const getToken = () => {
    return localStorage.getItem("wasteradar_token");
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/vehicles`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error("Load vehicles error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load vehicles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      vehicleType: "Garbage Truck",
      capacity: "",
      depotAddress: "",
      depotLatitude: "",
      depotLongitude: "",
      status: "AVAILABLE",
    });

    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const headers = {
        Authorization: `Bearer ${getToken()}`,
      };

      const vehicleData = {
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        capacity: Number(formData.capacity),
        depotAddress: formData.depotAddress,
        depotLatitude: formData.depotLatitude
          ? Number(formData.depotLatitude)
          : null,
        depotLongitude: formData.depotLongitude
          ? Number(formData.depotLongitude)
          : null,
        status: formData.status,
      };

      if (editingVehicle) {
        await axios.put(
          `${API_URL}/vehicles/${editingVehicle._id}`,
          vehicleData,
          {
            headers,
          }
        );

        alert("Vehicle updated successfully");
      } else {
        await axios.post(
          `${API_URL}/vehicles`,
          vehicleData,
          {
            headers,
          }
        );

        alert("Vehicle created successfully");
      }

      resetForm();
      await loadVehicles();
    } catch (error) {
      console.error("Save vehicle error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save vehicle"
      );
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);

    setFormData({
      vehicleNumber: vehicle.vehicleNumber || "",
      vehicleType:
        vehicle.vehicleType || "Garbage Truck",
      capacity: vehicle.capacity || "",
      depotAddress: vehicle.depotAddress || "",
      depotLatitude:
        vehicle.depotLatitude ?? "",
      depotLongitude:
        vehicle.depotLongitude ?? "",
      status: vehicle.status || "AVAILABLE",
    });

    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete vehicle ${vehicle.vehicleNumber}?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/vehicles/${vehicle._id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      alert("Vehicle deleted successfully");

      await loadVehicles();
    } catch (error) {
      console.error("Delete vehicle error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete vehicle"
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";

      case "ASSIGNED":
        return "bg-blue-100 text-blue-700";

      case "IN_USE":
        return "bg-yellow-100 text-yellow-700";

      case "MAINTENANCE":
        return "bg-orange-100 text-orange-700";

      case "INACTIVE":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-100"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Vehicle Management
              </h1>

              <p className="mt-1 text-slate-500">
                Manage waste collection vehicles in your village
              </p>
            </div>

          </div>

          <button
            onClick={() => {
              setEditingVehicle(null);

              setFormData({
                vehicleNumber: "",
                vehicleType: "Garbage Truck",
                capacity: "",
                depotAddress: "",
                depotLatitude: "",
                depotLongitude: "",
                status: "AVAILABLE",
              });

              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVehicle
                  ? "Edit Vehicle"
                  : "Add New Vehicle"}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Vehicle Number
                </label>

                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="MH-17-AB-1234"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Vehicle Type
                </label>

                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="Garbage Truck">
                    Garbage Truck
                  </option>

                  <option value="Mini Truck">
                    Mini Truck
                  </option>

                  <option value="Tractor">
                    Tractor
                  </option>

                  <option value="Tipper">
                    Tipper
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Capacity"
                  min="1"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Depot Address
                </label>

                <input
                  type="text"
                  name="depotAddress"
                  value={formData.depotAddress}
                  onChange={handleChange}
                  placeholder="Depot address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="AVAILABLE">
                    AVAILABLE
                  </option>

                  <option value="MAINTENANCE">
                    MAINTENANCE
                  </option>

                  <option value="INACTIVE">
                    INACTIVE
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Depot Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="depotLatitude"
                  value={formData.depotLatitude}
                  onChange={handleChange}
                  placeholder="19.5769"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Depot Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="depotLongitude"
                  value={formData.depotLongitude}
                  onChange={handleChange}
                  placeholder="74.4766"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                  {editingVehicle
                    ? "Update Vehicle"
                    : "Create Vehicle"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Vehicles
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {vehicles.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Available
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.status === "AVAILABLE"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Assigned
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.driverId
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Maintenance
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.status ===
                    "MAINTENANCE"
                ).length
              }
            </p>
          </div>

        </div>

        {/* Vehicles Table */}
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b border-gray-200 p-5">
            <h2 className="text-xl font-bold text-gray-900">
              Vehicles
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-10 text-center">

              <Truck
                size={48}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-gray-500">
                No vehicles found
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white"
              >
                Add First Vehicle
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Capacity
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Driver
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold text-gray-600">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle._id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="rounded-lg bg-blue-100 p-2">
                            <Truck
                              size={20}
                              className="text-blue-600"
                            />
                          </div>

                          <div>

                            <p className="font-semibold text-gray-900">
                              {vehicle.vehicleNumber}
                            </p>

                            {vehicle.depotAddress && (
                              <p className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} />
                                {vehicle.depotAddress}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {vehicle.vehicleType || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {vehicle.capacity}
                      </td>

                      <td className="px-5 py-4">

                        {vehicle.driverId ? (
                          <div>

                            <p className="flex items-center gap-1 font-medium text-gray-800">
                              <User size={14} />
                              {vehicle.driverId.name}
                            </p>

                            {vehicle.driverId.phone && (
                              <p className="text-xs text-gray-500">
                                {vehicle.driverId.phone}
                              </p>
                            )}

                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Not assigned
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(vehicle)
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(vehicle)
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
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
};

export default AdminVehicles;