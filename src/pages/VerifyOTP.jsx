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
  const navigate = useNavigate(); // ✅

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const { token } = await verifyOtp(email, otp);
      login(email, token);
      navigate("/dashboard");
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
        {loading ? "Verifying..." : "✅ Verify & Login"}
      </button>
    </div>
  );
};

export default VerifyOTP;
