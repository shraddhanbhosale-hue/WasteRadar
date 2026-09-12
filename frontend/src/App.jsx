import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminDrivers from "./pages/AdminDrivers";
import AdminVehicles from "./pages/AdminVehicles";

import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";

import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import ReportWaste from "./pages/ReportWaste";
import CitizenReports from "./pages/CitizenReports";
import SelectVillage from "./pages/SelectVillage";
import ReportDetails from "./pages/ReportDetails";
import WasteMap from "./pages/WasteMap";

import AdminReports from "./pages/AdminReports";
import AdminReportDetails from "./pages/AdminReportDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* CREATE ACCOUNT */}
        <Route
          path="/create-account"
          element={<CreateAccount />}
        />

        {/* ADMIN REPORTS */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* ADMIN VEHICLES */}
        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminVehicles />
            </ProtectedRoute>
          }
        />

        {/* ADMIN REPORT DETAILS */}
        <Route
          path="/admin/reports/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReportDetails />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DRIVERS */}
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDrivers />
            </ProtectedRoute>
          }
        />

        {/* CITIZEN DASHBOARD */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        {/* SELECT VILLAGE */}
        <Route
          path="/citizen/select-village"
          element={
            <ProtectedRoute>
              <SelectVillage />
            </ProtectedRoute>
          }
        />

        {/* CITIZEN MAP */}
        <Route
          path="/citizen/map"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <WasteMap />
            </ProtectedRoute>
          }
        />

        {/* CITIZEN REPORTS */}
        <Route
          path="/citizen/reports"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenReports />
            </ProtectedRoute>
          }
        />

        {/* CITIZEN REPORT DETAILS */}
        <Route
          path="/citizen/reports/:id"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <ReportDetails />
            </ProtectedRoute>
          }
        />

        {/* REPORT WASTE */}
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <ReportWaste />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* DRIVER DASHBOARD */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={["DRIVER"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
