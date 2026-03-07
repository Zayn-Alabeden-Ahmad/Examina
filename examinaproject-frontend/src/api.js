import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    // إذا كان الطلب مو تسجيل دخول ومو تسجيل جديد، ضيف التوكن
    if (
      token &&
      !config.url.includes("/login/") &&
      !config.url.includes("/register/")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
