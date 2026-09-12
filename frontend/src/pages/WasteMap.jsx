import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  RefreshCw,
  Recycle,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../services/api";

// --------------------------------------------------
// FIX LEAFLET DEFAULT MARKER ICON
// --------------------------------------------------

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --------------------------------------------------
// CUSTOM MARKER ICONS
// --------------------------------------------------

const createMarkerIcon = (type) => {
  let background = "#f59e0b";

  if (type === "high") {
    background = "#ef4444";
  }

  if (type === "resolved") {
    background = "#22c55e";
  }

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: ${background};
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// --------------------------------------------------
// MAP CENTER COMPONENT
// --------------------------------------------------

function MapCenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null
    ) {
      map.setView(
        [latitude, longitude],
        13
      );
    }
  }, [latitude, longitude, map]);

  return null;
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

function WasteMap() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userLocation, setUserLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  // ------------------------------------------------
  // FETCH REPORTS
  // ------------------------------------------------

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports");

      const data =
        response.data.reports ||
        response.data ||
        [];

      setReports(data);

      console.log(
        "Waste map reports:",
        data
      );
    } catch (error) {
      console.error(
        "Fetch map reports error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load waste locations."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // GET USER LOCATION
  // ------------------------------------------------

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setUserLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);

        console.log(
          "Current location:",
          latitude,
          longitude
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setError(
          "Unable to get your current location. Please allow location access in your browser."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------

  useEffect(() => {
    fetchReports();
    getCurrentLocation();
  }, []);

  // ------------------------------------------------
  // VALID REPORTS
  // ------------------------------------------------

  const validReports = reports.filter(
    (report) =>
      report.latitude !== undefined &&
      report.longitude !== undefined &&
      report.latitude !== null &&
      report.longitude !== null &&
      !Number.isNaN(
        Number(report.latitude)
      ) &&
      !Number.isNaN(
        Number(report.longitude)
      )
  );

  // ------------------------------------------------
  // STATISTICS
  // ------------------------------------------------

  const highSeverityCount =
    validReports.filter(
      (report) =>
        report.severity === "High"
    ).length;

  const resolvedCount =
    validReports.filter(
      (report) =>
        report.status === "RESOLVED"
    ).length;

  // ------------------------------------------------
  // MAP CENTER
  // ------------------------------------------------

  let mapCenter = [
    19.9526,
    74.9227,
  ];

  if (userLocation) {
    mapCenter = [
      userLocation.latitude,
      userLocation.longitude,
    ];
  } else if (validReports.length > 0) {
    mapCenter = [
      Number(validReports[0].latitude),
      Number(validReports[0].longitude),
    ];
  }

  // ------------------------------------------------
  // MARKER TYPE
  // ------------------------------------------------

  const getMarkerType = (report) => {
    if (report.status === "RESOLVED") {
      return "resolved";
    }

    if (report.severity === "High") {
      return "high";
    }

    return "active";
  };

  // ------------------------------------------------
  // STATUS FORMAT
  // ------------------------------------------------

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() =>
              navigate("/citizen")
            }
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

      {/* ================= MAIN ================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <p className="text-sm font-semibold text-green-700">
              WASTE MAP
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Waste Hotspots
            </h1>

            <p className="text-slate-500 mt-2">
              Explore reported waste locations in
              your community.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm disabled:opacity-50"
            >

              {locationLoading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Navigation size={17} />
              )}

              My Location

            </button>

            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm disabled:opacity-50"
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

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* LOCATIONS */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Reported Locations
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {validReports.length}
                </h2>

              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                <MapPin size={22} />
              </div>

            </div>

          </div>

          {/* HIGH SEVERITY */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  High Severity
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {highSeverityCount}
                </h2>

              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>

            </div>

          </div>

          {/* RESOLVED */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Resolved
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {resolvedCount}
                </h2>

              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* ================= MAP ================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* MAP HEADER */}

          <div className="p-6 border-b border-slate-100">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                  <MapPin size={21} />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Community Waste Map
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Click a marker to view report details.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* MAP AREA */}

          {loading ? (

            <div className="h-[600px] flex items-center justify-center bg-slate-50">

              <div className="flex flex-col items-center">

                <Loader2
                  size={35}
                  className="animate-spin text-green-700"
                />

                <p className="mt-4 text-slate-500">
                  Loading waste locations...
                </p>

              </div>

            </div>

          ) : (

            <div className="relative">

              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="h-[600px] w-full"
              >

                {/* OPENSTREETMAP */}

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* CENTER MAP ON USER */}

                {userLocation && (
                  <MapCenter
                    latitude={
                      userLocation.latitude
                    }
                    longitude={
                      userLocation.longitude
                    }
                  />
                )}

                {/* USER LOCATION */}

                {userLocation && (
                  <Marker
                    position={[
                      userLocation.latitude,
                      userLocation.longitude,
                    ]}
                  >

                    <Popup>

                      <div className="min-w-[180px]">

                        <div className="flex items-center gap-2">

                          <Navigation
                            size={18}
                            className="text-blue-600"
                          />

                          <strong>
                            Your Location
                          </strong>

                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          Latitude:{" "}
                          {userLocation.latitude.toFixed(
                            6
                          )}
                        </p>

                        <p className="text-xs text-slate-500">
                          Longitude:{" "}
                          {userLocation.longitude.toFixed(
                            6
                          )}
                        </p>

                      </div>

                    </Popup>

                  </Marker>
                )}

                {/* WASTE REPORT MARKERS */}

                {validReports.map(
                  (report) => (

                    <Marker
                      key={report._id}
                      position={[
                        Number(
                          report.latitude
                        ),
                        Number(
                          report.longitude
                        ),
                      ]}
                      icon={createMarkerIcon(
                        getMarkerType(report)
                      )}
                    >

                      <Popup>

                        <div className="min-w-[220px]">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-xs text-slate-400">
                                Report ID
                              </p>

                              <p className="font-bold text-slate-900">
                                {report.reportId ||
                                  report._id}
                              </p>

                            </div>

                            <span className="text-xs font-semibold">
                              {formatStatus(
                                report.status
                              )}
                            </span>

                          </div>

                          <div className="mt-3">

                            <p className="text-xs text-slate-400">
                              Waste Type
                            </p>

                            <p className="font-semibold text-slate-800">
                              {report.wasteType ||
                                "Other"}
                            </p>

                          </div>

                          <div className="mt-2">

                            <p className="text-xs text-slate-400">
                              Severity
                            </p>

                            <p
                              className={`font-semibold ${
                                report.severity ===
                                "High"
                                  ? "text-red-600"
                                  : report.severity ===
                                    "Medium"
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {report.severity ||
                                "Low"}
                            </p>

                          </div>

                          <div className="mt-2 flex items-center gap-1">

                            <MapPin
                              size={13}
                              className="text-green-700"
                            />

                            <span className="text-xs text-slate-500">
                              {Number(
                                report.latitude
                              ).toFixed(5)}
                              ,{" "}
                              {Number(
                                report.longitude
                              ).toFixed(5)}
                            </span>

                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/citizen/reports/${report._id}`
                              )
                            }
                            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold"
                          >
                            View Report
                            <ExternalLink
                              size={14}
                            />
                          </button>

                        </div>

                      </Popup>

                    </Marker>

                  )
                )}

              </MapContainer>

              {/* NO REPORT OVERLAY */}

              {validReports.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-6 text-center max-w-sm">

                    <MapPin
                      size={35}
                      className="mx-auto text-slate-400"
                    />

                    <h3 className="font-bold text-slate-900 mt-3">
                      No waste reports mapped yet
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Submit a waste report with GPS
                      location and it will appear here.
                    </p>

                  </div>

                </div>
              )}

            </div>

          )}

        </div>

        {/* ================= LEGEND ================= */}

        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5">

          <h3 className="font-bold text-slate-900 mb-4">
            Map Legend
          </h3>

          <div className="flex flex-wrap gap-6">

            <div className="flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-red-500" />

              <span className="text-sm text-slate-600">
                High severity
              </span>

            </div>

            <div className="flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-amber-500" />

              <span className="text-sm text-slate-600">
                Active report
              </span>

            </div>

            <div className="flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-green-500" />

              <span className="text-sm text-slate-600">
                Resolved
              </span>

            </div>

            <div className="flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-blue-500" />

              <span className="text-sm text-slate-600">
                Your location
              </span>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default WasteMap;