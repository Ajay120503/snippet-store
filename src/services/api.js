import axios from "axios";

// 🔧 Axios instance with base config
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// 🔐 Request interceptor: add Authorization token if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ❌ Response interceptor: auto handle unauthorized access
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("⚠️ Unauthorized. Token may be invalid or expired.");
    }
    return Promise.reject(err);
  }
);

////////////////////////////////////////////
// 🔓 PUBLIC SNIPPET ROUTES (No Auth Needed)
////////////////////////////////////////////

export const getSnippets = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await API.get(`/snippets${params ? `?${params}` : ""}`);
  return res.data;
};

//////////////////////////////////////////////////
// 🔐 AUTH ROUTES (OTP Login & Session Handling)
//////////////////////////////////////////////////

export const sendOtp = async (email) => {
  const res = await API.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await API.post("/auth/verify-otp", { email, otp });
  return res.data;
};

export const fetchAdmin = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

export const logoutAdmin = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};

//////////////////////////////////////////////////
// 🔐 ADMIN SNIPPET ROUTES (Require Auth Token)
//////////////////////////////////////////////////

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
