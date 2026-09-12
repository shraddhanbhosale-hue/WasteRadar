import { useEffect, useState } from "react";
import {
  MapPin,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SelectVillage = () => {
  const navigate = useNavigate();

  const { updateUser } = useAuth();

  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch villages
  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/villages");

      setVillages(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch villages:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load villages."
      );
    } finally {
      setLoading(false);
    }
  };

  // Save selected village
  const handleSaveVillage = async () => {
    if (!selectedVillage) {
      setError("Please select your village.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.put(
        "/villages/select",
        {
          villageId: selectedVillage,
        }
      );

      // Update user in AuthContext
      if (response.data.user) {
        updateUser(response.data.user);
      }

      // Go to Citizen Dashboard
      navigate("/citizen");
    } catch (error) {
      console.error(
        "Village selection error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save village."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-lg">

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <MapPin
                size={32}
                className="text-emerald-600"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-slate-900">
              Select Your Village
            </h1>

            <p className="text-slate-500 mt-2">
              Choose your village so WasteRadar
              can connect your reports with the
              correct collection team.
            </p>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-10">

              <Loader2
                size={28}
                className="animate-spin text-emerald-600"
              />

              <span className="ml-3 text-slate-600">
                Loading villages...
              </span>

            </div>
          ) : (
            <>
              {/* Village Select */}
              <div className="mb-5">

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Village
                </label>

                <select
                  value={selectedVillage}
                  onChange={(e) =>
                    setSelectedVillage(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >

                  <option value="">
                    Select your village
                  </option>

                  {villages.map((village) => (
                    <option
                      key={village._id}
                      value={village._id}
                    >
                      {village.name}

                      {village.district
                        ? ` - ${village.district}`
                        : ""}
                    </option>
                  ))}

                </select>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveVillage}
                disabled={
                  saving || !selectedVillage
                }
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />

                    Continue to Dashboard
                  </>
                )}

              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default SelectVillage;
