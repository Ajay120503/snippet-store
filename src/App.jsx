import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import AdminLoginStep1 from "./pages/AdminLoginUsername.jsx"; // Step 1 (username/pass)
import AdminLoginOTP from "./pages/AdminLogin.jsx";           // Step 2 (email + OTP)
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./layout/ProtectedRoute.jsx";
import PreAuthRoute from "./layout/PreAuthRoute.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-base-100 text-base-content">
      <Navbar />
      <Toaster position="top-center" />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLoginStep1 />} />

        {/* Gate /admin behind pre-auth (must pass /admin-login first) */}
        <Route element={<PreAuthRoute />}>
          <Route path="/admin" element={<AdminLoginOTP />} />
        </Route>

        {/* Fully protected area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="text-center h-screen flex justify-center items-center text-xl text-error">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </div>
  );
}
