import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../services/api";
import OTPInput from "../components/OTPInput.jsx";
import { useAuth } from "../hooks/useAuth";

const VerifyOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const emailLc = email.trim().toLowerCase();
      const code = otp.trim();

      // Call API
      const res = await verifyOtp(emailLc, code);
      const token = res?.token;

      // ✅ Save the JWT so the interceptor can attach Authorization header
      if (token) {
        localStorage.setItem("token", token);
      } else if (!res?.ok) {
        // If you haven't enabled cookie mode on the server, token must be present
        throw new Error("Token missing from server response");
      }

      // Clear step‑1 flag now that we’re fully authenticated
      sessionStorage.removeItem("preAuthOK");

      // This should set context admin (and may navigate in useAuth.login)
      await login(emailLc, token);

      // If your useAuth.login doesn't navigate, keep this line:
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("❌ Invalid OTP or email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-sm p-4 mt-10 shadow-lg rounded-lg bg-base-100">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Verify OTP</h2>

      <input
        type="email"
        placeholder="Enter your admin email"
        className="input input-bordered w-full mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <OTPInput otp={otp} setOtp={setOtp} />

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <button
        onClick={handleVerify}
        className="btn btn-primary mt-4 w-full"
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify & Login"}
      </button>
    </div>
  );
};

export default VerifyOTP;
