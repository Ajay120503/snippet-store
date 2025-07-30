import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, User2, Loader2 } from "lucide-react";

const AdminLoginUsername = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    username.trim() !== "" && password.trim() !== "" && !loading;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit) {
      toast.error("Please enter both fields.");
      return;
    }

    setLoading(true);
    try {
      // Read envs (frontend only). These must be in client/.env.local and start with VITE_
      const envUser = (import.meta.env.VITE_ADMIN_USERNAME ?? "").trim();
      const envPass = (import.meta.env.VITE_ADMIN_PASSWORD ?? "").trim();

      if (!envUser || !envPass) {
        console.warn(
          "[Step1] Missing VITE_ADMIN_USERNAME / VITE_ADMIN_PASSWORD in client env. Using DEV fallback."
        );
      }

      // DEV fallback only if envs are not set (do NOT rely on in production)
      const fallbackUser = "admin";
      const fallbackPass = "admin123";

      const userOk = envUser ? username.trim() === envUser : username.trim() === fallbackUser;
      const passOk = envPass ? password.trim() === envPass : password.trim() === fallbackPass;

      if (userOk && passOk) {
        sessionStorage.setItem("preAuthOK", "true");
        console.log(
          "[Step1] credentials OK, preAuthOK:",
          sessionStorage.getItem("preAuthOK")
        );
        toast.success("Step 1 verified. Continue with email verification.");

        // If they tried to access a protected page earlier, you could read from state
        // but for OTP flow we go straight to /admin
        const to = location.state?.from?.pathname || "/admin";
        console.log("[Step1] navigating to:", to);
        navigate("/admin"); // keep simple while debugging
        return; // ensure we don't continue the function
      } else {
        toast.error("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPasswordKey = (e) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm p-6 bg-base-100 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Admin Login</h2>
          <p className="text-sm text-base-content/60 mt-1">
            Step 1 — Username &amp; Password
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Username</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter username"
                className="input input-bordered w-full pr-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                aria-label="Admin username"
              />
              <User2
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                size={18}
              />
            </div>
          </label>

          {/* Password */}
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Password</span>
              {capsLock && (
                <span className="label-text-alt text-warning">
                  Caps Lock is ON
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                className="input input-bordered w-full pr-20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onPasswordKey}
                onKeyDown={onPasswordKey}
                disabled={loading}
                aria-label="Admin password"
              />
              <Lock
                className="absolute right-10 top-1/2 -translate-y-1/2 opacity-40"
                size={18}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs px-2 absolute right-0 top-1/2 -translate-y-1/2"
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Checking…
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-base-content/50 mt-4">
          You’ll be asked for email OTP in the next step.
        </p>

        <div className="divider my-5"></div>

        <div className="text-center text-xs text-base-content/60">
          For development only. Do not ship real secrets in client code.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginUsername;
