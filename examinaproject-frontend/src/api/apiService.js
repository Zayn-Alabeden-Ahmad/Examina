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
// Fetch levels for the teacher to select the base difficulty
export const getLevels = () => API.get("/exams/levels/");

// Create a new Boss Challenge
export const createChallenge = (challengeData) =>
  API.post("/exams/challenges/", challengeData);

// Fetch all existing challenges
export const getAllChallenges = () => API.get("/exams/challenges/");

// جلب التحديات لطالب معين (لحساب الـ IsUnlocked)
export const getStudentChallenges = (studentId) =>
  API.get(`/exams/challenges/student/${studentId}/`);

// توليد أسئلة لتحدي معين
export const generateChallengeQuestions = (challengeId, studentId) =>
  API.get(`/exams/challenges/${challengeId}/questions/${studentId}`);

// إرسال حل التحدي
export const submitChallenge = (payload) =>
  API.post(`/exams/challenges/submit/`, payload);

export default API;
