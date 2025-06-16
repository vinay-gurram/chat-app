import axios from "axios";

let hasRedirected = false;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ Important for sending cookies
});

// ✅ Interceptor to handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !hasRedirected &&
      window.location.pathname !== "/login"
    ) {
      hasRedirected = true;
      localStorage.clear();
      window.location.replace("/login"); // Prevent back button loop
    }
    return Promise.reject(error);
  }
);
