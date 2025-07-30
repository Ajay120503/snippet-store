import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { sendOtp, verifyOtp } from "../services/api";

const RESEND_SECONDS = 45;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [resendLeft, setResendLeft] = useState(0);
  const timerRef = useRef(null);
  const otpInputRef = useRef(null);
  const emailInputRef = useRef(null);

  // HARD GUARD: must pass step-1 (username/password page should set this)
  useEffect(() => {
    const preAuthOK = sessionStorage.getItem("preAuthOK") === "true";
    if (!preAuthOK) navigate("/admin-login", { replace: true });
  }, [navigate]);

  // If already logged in, skip to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (step === 1) emailInputRef.current?.focus();
  }, [step]);

  const isValidEmail = useCallback(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    []
  );

  const startResendCountdown = useCallback(() => {
    setResendLeft(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRequestOtp = async () => {
    const emailLc = email.trim().toLowerCase();
    if (!emailLc) return toast.error("Email is required.");
    if (!isValidEmail(emailLc)) return toast.error("Invalid email format.");
    setEmail(emailLc);

    setLoading(true);
    try {
      await sendOtp(emailLc);
      setStep(2);
      setOtp("");
      startResendCountdown();
      toast.success("OTP sent to your email.");
      setTimeout(() => otpInputRef.current?.focus?.(), 150);
    } catch {
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return toast.error("OTP must be 6 digits.");
    setLoading(true);
    try {
      const emailLc = email.trim().toLowerCase();

      const res = await verifyOtp(emailLc, otp);
      const token = res?.token;

      // ✅ Save token for the Axios interceptor (header mode)
      if (token) {
        localStorage.setItem("token", token);
      } else if (!res?.ok) {
        // If you didn't enable cookie mode, token must be present
        throw new Error("Token missing from server response");
      }

      // Clear step‑1 flag now that we’re fully authenticated
      sessionStorage.removeItem("preAuthOK");

      await login(emailLc, token);
      toast.success("🎉 Login successful!");

      // If useAuth.login doesn't navigate, keep this line:
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Invalid OTP or email.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (step === 1 && !loading) handleRequestOtp();
      if (step === 2 && !loading) handleVerifyOtp();
    }
  };

  const handleResend = async () => {
    if (resendLeft > 0 || loading) return;
    if (!isValidEmail(email)) return toast.error("Enter a valid email first.");
    setLoading(true);
    try {
      await sendOtp(email);
      startResendCountdown();
      toast.success("New OTP sent.");
    } catch {
      toast.error("Could not resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 bg-base-100 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-1">
            {step === 1 ? "Email Verification" : "Enter OTP"}
          </h2>
          <p className="text-sm text-base-content/60">
            {step === 1
              ? "Step 2 — Enter your admin email to receive an OTP"
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <input
            ref={emailInputRef}
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full"
            disabled={loading || step === 2}
            onKeyDown={handleKeyDown}
          />

          {/* OTP */}
          {step === 2 && (
            <>
              {/* If you have OTPInput component, use it */}
              {/* <OTPInput otp={otp} setOtp={setOtp} length={6} /> */}

              {/* Fallback single input */}
              <input
                ref={otpInputRef}
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
                className="input input-bordered w-full tracking-widest text-center text-lg"
                inputMode="numeric"
                maxLength={6}
                disabled={loading}
                onKeyDown={handleKeyDown}
              />

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="btn btn-link btn-xs px-0"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    emailInputRef.current?.focus();
                    if (timerRef.current) clearInterval(timerRef.current);
                    setResendLeft(0);
                  }}
                  disabled={loading}
                >
                  Change email
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={handleResend}
                  disabled={loading || resendLeft > 0}
                  aria-disabled={loading || resendLeft > 0}
                  title={
                    resendLeft > 0 ? `Resend available in ${resendLeft}s` : "Resend OTP"
                  }
                >
                  {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {/* Primary Action */}
          <button
            className={`btn w-full ${step === 1 ? "btn-primary" : "btn-success"}`}
            onClick={step === 1 ? handleRequestOtp : handleVerifyOtp}
            disabled={
              loading ||
              (step === 1 && !isValidEmail(email)) ||
              (step === 2 && !/^\d{6}$/.test(otp))
            }
          >
            {loading
              ? step === 1
                ? "Sending OTP..."
                : "Verifying..."
              : step === 1
              ? "Send OTP"
              : "Login"}
          </button>
        </div>

        <div className="text-center text-xs text-base-content/50">
          Admin access is restricted and monitored.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
