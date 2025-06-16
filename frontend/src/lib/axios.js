import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ✅ Interceptor to handle 401 Unauthorized globally
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
