import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// إضافة "اعتراض" (Interceptor) لكل طلب يخرج للسيرفر
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      // حقن التوكن في الهيدر تلقائياً
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // إذا انتهت الصلاحية، يمكن توجيه المستخدم لتسجيل الدخول
      // localStorage.clear();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const registerStudent = (data) => API.post("/register/student/", data);
export const loginUser = (data) => API.post("/login/", data);
export const logoutUser = (refreshToken) =>
  API.post("/logout/", { refresh: refreshToken });

export default API;
