import axios from "axios";

// -------- Token helpers (centralized) --------
const TOKEN_KEY = "token";

export const authToken = {
  get() {
    // prefer localStorage; fall back to sessionStorage if needed
    return (
      (typeof localStorage !== "undefined" && localStorage.getItem(TOKEN_KEY)) ||
      (typeof sessionStorage !== "undefined" && sessionStorage.getItem(TOKEN_KEY)) ||
      null
    );
  },
  set(token) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clear() {
    if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_KEY);
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(TOKEN_KEY);
  },
};

// -------- Base URL (ensure it’s set in prod) --------
const baseURL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ""
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5000/api";

if (import.meta.env.PROD && baseURL.startsWith("http://localhost")) {
  // Helpful warning during real deployments
  // eslint-disable-next-line no-console
  console.warn(
    "[api] VITE_API_URL not set for production build; using localhost. " +
      "Set VITE_API_URL=https://snippet-store-backend.onrender.com/api before building."
  );
}

// -------- Axios instance --------
const API = axios.create({
  baseURL,
  // Keep withCredentials ONLY if you are using httpOnly cookie auth.
  // It’s harmless to leave on, but it will trigger CORS preflights and requires proper CORS config.
  withCredentials: true,
});

// -------- Request interceptor: attach Authorization --------
API.interceptors.request.use((config) => {
  const token = authToken.get();
  // Always ensure headers exists
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------- Response interceptor: handle 401/403 globally --------
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ ${status} Unauthorized/Forbidden. Clearing token.`);
      authToken.clear();
      // Optional: soft redirect if you're outside React Router context
      // if (typeof window !== "undefined") window.location.assign("/admin-login");
    }
    return Promise.reject(err);
  }
);

// -------- Public Snippet Routes --------
export const getSnippets = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await API.get(`/snippets${params ? `?${params}` : ""}`);
  return res.data;
};

// -------- Auth Routes (OTP Login & Session) --------

export const sendOtp = async (email) => {
  const clean = String(email || "").trim().toLowerCase();
  const res = await API.post("/auth/send-otp", { email: clean });
  return res.data; // { message }
};

export const verifyOtp = async (email, otp) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();

  const res = await API.post("/auth/verify-otp", { email: cleanEmail, otp: cleanOtp });
  const data = res.data; // expected { token } or { ok: true } if cookie mode

  // Convenience: if server returned a token (header mode), persist it here
  if (data?.token) {
    authToken.set(data.token);
  }

  return data;
};

export const fetchAdmin = async () => {
  const res = await API.get("/auth/me"); // protect() accepts header or cookie
  return res.data; // { admin: { email, iat, exp, ... } }
};

export const logoutAdmin = async () => {
  try {
    const res = await API.post("/auth/logout");
    return res.data;
  } finally {
    // Always clear local token on client logout
    authToken.clear();
  }
};

// -------- Admin Snippet Routes (Require Auth) --------
export const createSnippet = async (snippet) => {
  const res = await API.post("/snippets", snippet);
  return res.data;
};

export const updateSnippet = async (id, snippet) => {
  const res = await API.put(`/snippets/${id}`, snippet);
  return res.data;
};

export const deleteSnippet = async (id) => {
  const res = await API.delete(`/snippets/${id}`);
  return res.data;
};

// Optionally export API if you need to use it directly elsewhere
export { API };
