import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import AdminLoginStep1 from "./pages/AdminLoginUsername.jsx"; // Step 1 (username/pass)
import AdminLoginOTP from "./pages/AdminLogin.jsx";           // Step 2 (email + OTP)
import Dashboard from "./pages/Dashboard.jsx";

import ProtectedRoute from "./layout/ProtectedRoute.jsx";     // real auth gate
import PreAuthRoute from "./layout/PreAuthRoute.jsx";         // OTP gate (needs preAuthOK)

import Navbar from "./components/Navbar.jsx";

// Optional: hide navbar on auth pages (login/otp) for a cleaner look
const AuthlessLayout = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = pathname === "/admin-login" || pathname === "/admin";
  return (
    <div className="min-h-screen overflow-hidden bg-base-100 text-base-content">
      {!hideNav && <Navbar />}
      <Toaster position="top-center" />
      {children}
    </div>
  );
};

export default function App() {
  return (
    <AuthlessLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLoginStep1 />} />

        {/* Step-2 (OTP) — only accessible if sessionStorage.preAuthOK === "true" and NOT already logged in */}
        <Route element={<PreAuthRoute />}>
          <Route path="/admin" element={<AdminLoginOTP />} />
        </Route>

        {/* Protected area — must be logged in (valid token/cookie) */}
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
    </AuthlessLayout>
  );
}
