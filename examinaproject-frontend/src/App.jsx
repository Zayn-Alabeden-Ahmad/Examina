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
      </Routes>
    </Router>
  );
}

export default App;
