import {
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Recycle,
  ShieldCheck,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-green-700 text-white flex items-center justify-center">
              <Recycle size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WasteRadar
              </h1>

              <p className="text-xs text-slate-500">
                Smart Waste Management
              </p>
            </div>

          </div>

          {/* RIGHT NAV */}
          <div className="flex items-center gap-4">

            <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition">
              <Bell size={21} className="text-slate-600" />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">

              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name || "Citizen"}
                </p>

                <p className="text-xs text-slate-500">
                  Citizen
                </p>
              </div>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* WELCOME */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm font-semibold text-green-700 mb-1">
              CITIZEN DASHBOARD
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome, {user?.name?.split(" ")[0] || "Citizen"} 👋
            </h2>

            <p className="mt-2 text-slate-500">
              Help keep your community clean and healthy.
            </p>
          </div>

          <button
            onClick={() => navigate("/citizen/report")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold shadow-lg shadow-green-700/20 transition"
          >
            <Plus size={20} />
            Report Waste
          </button>

        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Reports
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  0
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp size={22} />
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Your submitted reports
            </p>

          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  0
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 size={22} />
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Waiting for collection
            </p>

          </div>

          {/* RESOLVED */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Resolved
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  0
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Waste successfully collected
            </p>

          </div>

          {/* IMPACT */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Community Impact
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  Active
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Every report makes a difference
            </p>

          </div>

        </div>

        {/* ================= CONTENT GRID ================= */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* RECENT REPORTS */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Reports
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Track your latest waste reports.
                </p>
              </div>

              <button
                onClick={() => navigate("/citizen/reports")}
                className="text-sm font-semibold text-green-700 hover:text-green-800"
              >
                View all
              </button>

            </div>

            {/* EMPTY STATE */}
            <div className="p-10 text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <Recycle size={30} />
              </div>

              <h4 className="text-lg font-semibold text-slate-800">
                No reports yet
              </h4>

              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                Found waste in your area? Report it and
                help your community get it cleaned.
              </p>

              <button
                onClick={() => navigate("/citizen/report")}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition"
              >
                <Plus size={18} />
                Report Your First Waste
              </button>

            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <h3 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h3>

            <p className="text-sm text-slate-500 mt-1 mb-5">
              Manage your WasteRadar activity.
            </p>

            <div className="space-y-3">

              <button
                onClick={() => navigate("/citizen/report")}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition text-left"
              >

                <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center">
                  <Plus size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Report Waste
                  </p>

                  <p className="text-xs text-slate-500">
                    Upload photo and location
                  </p>
                </div>

              </button>

              <button
                onClick={() => navigate("/citizen/reports")}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-left"
              >

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                  <Clock3 size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Track Reports
                  </p>

                  <p className="text-xs text-slate-500">
                    Check report status
                  </p>
                </div>

              </button>

              <button
                onClick={() => navigate("/citizen/map")}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-left"
              >

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-green-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Waste Map
                  </p>

                  <p className="text-xs text-slate-500">
                    Explore reported locations
                  </p>
                </div>

              </button>

            </div>

          </div>

        </div>

        {/* ================= INFO BANNER ================= */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} />

              <span className="font-semibold">
                AI-Powered Waste Detection
              </span>
            </div>

            <p className="text-sm text-green-100 max-w-2xl">
              WasteRadar analyzes your uploaded image using
              AI before sending the report for administrative review.
            </p>

          </div>

          <button
            onClick={() => navigate("/citizen/report")}
            className="px-5 py-2.5 rounded-xl bg-white text-green-700 font-semibold text-sm hover:bg-green-50 transition whitespace-nowrap"
          >
            Report Waste
          </button>

        </div>

      </main>

    </div>
  );
}

export default CitizenDashboard;