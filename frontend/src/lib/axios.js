import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ sends cookies
});

// ✅ Global 401 Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized - redirecting to login...");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
