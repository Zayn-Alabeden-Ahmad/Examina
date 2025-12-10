import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // عدل حسب رابط Django
});

export const registerStudent = (data) => API.post("/register/student/", data);
export const loginUser = (data) => API.post("/login/", data);
export const logoutUser = (refreshToken) =>
  API.post("/logout/", { refresh: refreshToken });
export const getProfile = (token) =>
  API.get("/home/", { headers: { Authorization: `Bearer ${token}` } });

export default API;
