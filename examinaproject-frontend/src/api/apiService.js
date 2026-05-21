import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// إضافة "اعتراض" (Interceptor) لكل طلب يخرج للسيرفر
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
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
      // localStorage.clear();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const getMyProfile = () => API.get("/my-profile/");

export const updateMyProfile = (formData) => API.put("/my-profile/", formData);

export const getStudentLeaderboard = () => API.get("/leaderboard/students/");
export const getTeacherLeaderboard = () => API.get("/leaderboard/teachers/");
export const getStudentProfileDetail = (id) =>
  API.get(`/profile/student/${id}/`);
export const getTeacherProfileDetail = (id) =>
  API.get(`/profile/teacher/${id}/`);

export const registerStudent = (data) => API.post("/register/student/", data);
export const loginUser = (data) => API.post("/login/", data);
export const logoutUser = (refreshToken) =>
  API.post("/logout/", { refresh: refreshToken });
export const getLevels = () => API.get("/exams/levels/");
export const createChallenge = (challengeData) =>
  API.post("/exams/challenges/", challengeData);
export const getAllChallenges = () => API.get("/exams/challenges/");
export const getStudentChallenges = (studentId) =>
  API.get(`/exams/challenges/student/${studentId}/`);
export const generateChallengeQuestions = (challengeId, studentId) =>
  API.get(`/exams/challenges/${challengeId}/questions/${studentId}`);
export const submitChallenge = (payload) =>
  API.post(`/exams/challenges/submit/`, payload);
export const searchStudents = (q = "") =>
  API.get("/teacher/students/search/", { params: { q } });
export const searchTeachers = (q = "") =>
  API.get("/teacher/teachers/search/", { params: { q } });
export const getChaosEntry = () => API.get("/exams/chaos/entry/");
export const selectChaosCard = (card_id) =>
  API.post("/exams/chaos/select-card/", { card_id });
export const getChaosQuestions = () => API.get("/exams/chaos/questions/");
export const submitChaosAnswers = (payload) =>
  API.post("/exams/chaos/submit/", payload);
export default API;
