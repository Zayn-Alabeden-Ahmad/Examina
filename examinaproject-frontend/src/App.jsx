import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Categories from "./pages/Categories";
import QuizPage from "./pages/QuizPage";
import Achievements from "./pages/Achievements";
import ManageQuestions from "./pages/ManageQuestions";
import TeacherChallenges from "./pages/TeacherChallenges";
import StudentChallenges from "./pages/StudentChallenges";
import MissionRoom from "./pages/MissionRoom";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import MyProfile from "./pages/MyProfile";
import TeacherStudentSearch from "./pages/TeacherStudentSearch";
import TeacherSearchTeachers from "./pages/TeacherSearchTeachers";
import ChaosModeEntry from "./pages/ChaosModeEntry";
import ChaosModeQuiz from "./pages/ChaosModeQuiz";
import ChaosModeReport from "./pages/ChaosModeReport";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:categoryName"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <ManageQuestions />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher-challenges" element={<TeacherChallenges />} />
        <Route path="/challenges-list" element={<StudentChallenges />} />
        <Route
          path="/mission/:challengeId"
          element={
            <ProtectedRoute>
              <MissionRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:type/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-students-search"
          element={
            <ProtectedRoute>
              <TeacherStudentSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-teachers-search"
          element={
            <ProtectedRoute>
              <TeacherSearchTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chaos-mode"
          element={
            <ProtectedRoute>
              <ChaosModeEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chaos-mode/quiz"
          element={
            <ProtectedRoute>
              <ChaosModeQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chaos-mode/report"
          element={
            <ProtectedRoute>
              <ChaosModeReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
