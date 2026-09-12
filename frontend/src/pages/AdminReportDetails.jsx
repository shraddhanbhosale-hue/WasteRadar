import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Truck,
  Loader2,
} from "lucide-react";

import api from "../services/api";

function AdminReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH REPORT
  // ==========================================

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/reports/${id}`);

      setReport(response.data);
    } catch (error) {
      console.error("Fetch report error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH AVAILABLE VEHICLES
  // ==========================================

  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);

      const response = await api.get("/vehicles");

      const allVehicles = response.data.vehicles || [];

      const availableVehicles = allVehicles.filter(
        (vehicle) =>
          vehicle.status === "AVAILABLE"
      );

      setVehicles(availableVehicles);
    } catch (error) {
      console.error(
        "Fetch vehicles error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load vehicles."
      );
    } finally {
      setVehiclesLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  useEffect(() => {
    if (report?.status === "ADMIN_REVIEW") {
      fetchVehicles();
    }
  }, [report?.status]);

  // ==========================================
  // APPROVE REPORT
  // ==========================================

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.put(
        `/admin/reports/${id}/approve`
      );

      setSuccess(
        "Report approved successfully."
      );

      await fetchReport();
    } catch (error) {
      console.error(
        "Approve report error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to approve report."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // REJECT REPORT
  // ==========================================

  const handleReject = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.put(
        `/admin/reports/${id}/reject`
      );

      setSuccess(
        "Report rejected successfully."
      );

      await fetchReport();
    } catch (error) {
      console.error(
        "Reject report error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to reject report."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // ASSIGN VEHICLE
  // ==========================================

  const handleAssignVehicle = async () => {
    if (!selectedVehicle) {
      setError(
        "Please select a vehicle first."
      );

      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.put(
        `/admin/reports/${id}/assign-vehicle`,
        {
          vehicleId: selectedVehicle,
        }
      );

      setSuccess(
        "Vehicle assigned successfully."
      );

      setSelectedVehicle("");

      await fetchReport();
    } catch (error) {
      console.error(
        "Assign vehicle error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to assign vehicle."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-green-700"
        />
      </div>
    );
  }

  // ==========================================
  // REPORT NOT FOUND
  // ==========================================

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <button
          onClick={() =>
            navigate("/admin/reports")
          }
          className="flex items-center gap-2 text-green-700 font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Reports
        </button>

        <p className="mt-8 text-red-600">
          {error || "Report not found."}
        </p>
      </div>
    );
  }

  const imageUrl =
    report.imageUrl?.startsWith("http")
      ? report.imageUrl
      : `http://localhost:5000${report.imageUrl}`;

  const canReview =
    report.status === "REPORTED" ||
    report.status === "AI_VERIFIED" ||
    report.status === "ADMIN_REVIEW";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() =>
              navigate("/admin/reports")
            }
            className="flex items-center gap-2 text-slate-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Reports
          </button>

          <div className="mt-5">
            <p className="text-sm font-semibold text-green-700">
              ADMIN CONTROL CENTER
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Report Details
            </h1>

            <p className="text-slate-500 mt-1">
              Review and manage this waste report.
            </p>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {/* ========================================
            SUCCESS
        ======================================== */}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ======================================
              IMAGE
          ====================================== */}

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Waste Evidence
              </h2>
            </div>

            <div className="p-5">
              <img
                src={imageUrl}
                alt="Waste report"
                className="w-full max-h-[500px] object-contain rounded-xl bg-slate-100"
              />
            </div>

          </div>

          {/* ======================================
              REPORT INFORMATION
          ====================================== */}

          <div className="space-y-6">

            {/* REPORT ID + STATUS */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <p className="text-xs font-semibold text-slate-400 uppercase">
                Report ID
              </p>

              <p className="text-lg font-bold text-slate-900 mt-1">
                {report.reportId}
              </p>

              <div className="mt-5">

                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Status
                </p>

                <span className="inline-flex mt-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                  {report.status}
                </span>

              </div>

            </div>

            {/* WASTE DETAILS */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <h2 className="font-bold text-slate-900 mb-5">
                Waste Information
              </h2>

              <div className="space-y-4">

                <div>
                  <p className="text-xs text-slate-400">
                    Waste Type
                  </p>

                  <p className="font-semibold text-slate-800">
                    {report.wasteType}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Severity
                  </p>

                  <p className="font-semibold text-red-600">
                    {report.severity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    AI Confidence
                  </p>

                  <p className="font-semibold text-slate-800">
                    {report.aiConfidence
                      ? `${Math.round(
                          report.aiConfidence * 100
                        )}%`
                      : "N/A"}
                  </p>
                </div>

              </div>

            </div>

            {/* CITIZEN */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <h2 className="font-bold text-slate-900 mb-5">
                Citizen
              </h2>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <User size={19} />
                </div>

                <div>

                  <p className="font-semibold text-slate-800">
                    {report.userId?.name ||
                      "Unknown"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {report.userId?.email ||
                      "No email"}
                  </p>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ========================================
            LOCATION
        ======================================== */}

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <h2 className="font-bold text-slate-900 mb-5">
            Location
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <div className="flex items-center gap-3">

              <MapPin
                className="text-green-700"
                size={20}
              />

              <div>

                <p className="text-xs text-slate-400">
                  Village
                </p>

                <p className="font-semibold">
                  {report.villageId?.name ||
                    "Unknown"}
                </p>

              </div>

            </div>

            <div>
              <p className="text-xs text-slate-400">
                Latitude
              </p>

              <p className="font-semibold">
                {report.latitude}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Longitude
              </p>

              <p className="font-semibold">
                {report.longitude}
              </p>
            </div>

          </div>

          {report.address && (
            <p className="mt-5 text-sm text-slate-600">
              {report.address}
            </p>
          )}

        </div>

        {/* ========================================
            DESCRIPTION
        ======================================== */}

        {report.description && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h2 className="font-bold text-slate-900 mb-3">
              Citizen Description
            </h2>

            <p className="text-slate-600 leading-relaxed">
              {report.description}
            </p>

          </div>
        )}

        {/* ========================================
            APPROVE / REJECT
        ======================================== */}

        {canReview && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h2 className="font-bold text-slate-900">
              Admin Decision
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review this report before assigning a collection vehicle.
            </p>

            <div className="flex flex-wrap gap-4 mt-5">

              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold"
              >

                {actionLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle size={18} />
                )}

                Approve Report

              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold"
              >

                <XCircle size={18} />

                Reject Report

              </button>

            </div>

          </div>
        )}

        {/* ========================================
            VEHICLE ASSIGNMENT
        ======================================== */}

        {report.status === "ADMIN_REVIEW" && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <Truck
                  size={22}
                  className="text-green-700"
                />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Assign Collection Vehicle
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Select an available vehicle for this waste collection.
                </p>

              </div>

            </div>

            {/* VEHICLE SELECT */}

            <div className="mt-6">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Available Vehicle
              </label>

              {vehiclesLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Loading available vehicles...
                </div>
              ) : vehicles.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-800 text-sm">
                  No available vehicles found in your village.
                </div>
              ) : (
                <select
                  value={selectedVehicle}
                  onChange={(e) =>
                    setSelectedVehicle(
                      e.target.value
                    )
                  }
                  disabled={actionLoading}
                  className="w-full md:w-2/3 border border-slate-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >

                  <option value="">
                    Select a vehicle
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle._id}
                      value={vehicle._id}
                    >
                      {vehicle.vehicleNumber}
                      {" — "}
                      {vehicle.vehicleType ||
                        "Waste Collection Vehicle"}
                      {" — Capacity: "}
                      {vehicle.capacity}
                    </option>
                  ))}

                </select>
              )}

            </div>

            {/* ASSIGN BUTTON */}

            {vehicles.length > 0 && (
              <button
                onClick={handleAssignVehicle}
                disabled={
                  actionLoading ||
                  !selectedVehicle
                }
                className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold"
              >

                {actionLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Truck size={18} />
                )}

                Assign Vehicle

              </button>
            )}

          </div>
        )}

        {/* ========================================
            ASSIGNED VEHICLE
        ======================================== */}

        {report.status === "VEHICLE_ASSIGNED" &&
          report.vehicleId && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <Truck
                  className="text-green-700"
                  size={24}
                />

                <div>

                  <h2 className="font-bold text-green-900">
                    Vehicle Assigned
                  </h2>

                  <p className="text-sm text-green-700 mt-1">
                    A collection vehicle has been assigned to this report.
                  </p>

                </div>

              </div>

              <div className="mt-5 grid md:grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-green-700">
                    Vehicle Number
                  </p>

                  <p className="font-bold text-green-900">
                    {report.vehicleId
                      ?.vehicleNumber ||
                      "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-green-700">
                    Vehicle Type
                  </p>

                  <p className="font-semibold text-green-900">
                    {report.vehicleId
                      ?.vehicleType ||
                      "Waste Collection"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-green-700">
                    Capacity
                  </p>

                  <p className="font-semibold text-green-900">
                    {report.vehicleId
                      ?.capacity || "N/A"}
                  </p>
                </div>

              </div>

            </div>
          )}

        {/* ========================================
            DATE
        ======================================== */}

        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">

          <Calendar size={16} />

          {new Date(
            report.createdAt
          ).toLocaleString()}

        </div>

      </main>

    </div>
  );
}

export default AdminReportDetails;