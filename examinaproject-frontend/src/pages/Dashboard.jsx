import { useEffect, useState } from "react";
import api from "../api/apiService";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./arcade.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const API_BASE_URL = "http://127.0.0.1:8000";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/home/");
        const userData = res.data.user_data || res.data;
        console.log("User Data Response:", res.data);
        if (userData && userData.student_id) {
          setUser(userData);
          localStorage.setItem("studentId", userData.student_id);
        } else if (userData) {
          setUser(userData);
        } else {
          console.error("student_id not found in response");
        }

        if (res.data.has_new_achievements) {
          setHasNewAchievement(true);
        }

        // تخزين الـ student_id لاستخدامه في جلب التحديات لاحقاً
        if (userData.student_id) {
          localStorage.setItem("studentId", userData.student_id);
        }

        if (userData.points !== undefined || userData.role === "student") {
          setUserType("student");
        } else {
          setUserType("teacher");
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light arcade-font">
        LOADING DATA...
      </div>
    );
  }

  const getStatusValue = (obj) => obj?.status ?? obj?.Status ?? "";
  const isOnline = (obj) => {
    const s = String(getStatusValue(obj)).trim().toLowerCase();
    return s === "active" || s === "online" || s === "true" || s === "1";
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await api.post("/logout/", { refresh });
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("studentId");
      window.location.href = "/";
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  return (
    <div
      className="dashboard-page min-vh-100 text-white"
      style={{
        background: "linear-gradient(to bottom, #0f172a, #1e3a8a, #2563eb)",
      }}>
      {/* Header Section */}
      <div
        className="container-fluid py-3"
        style={{
          borderBottom: "3px solid #facc15",
          boxShadow: "0 0 15px #facc15",
        }}>
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="fw-bold text-warning arcade-font"
            style={{
              fontSize: "28px",
              letterSpacing: "3px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}>
            🎮 Examina
          </div>

          <div className="d-flex align-items-center hero-image bg-dark bg-opacity-75 p-3 rounded border border-warning shadow">
            {user.profile_picture && (
              <img
                src={
                  user.profile_picture.startsWith("http")
                    ? user.profile_picture
                    : `${API_BASE_URL}${user.profile_picture}`
                }
                alt="Profile"
                className="rounded-circle me-3"
                style={{
                  width: "50px", // يمكنك تغيير القيمة حسب الرغبة (مثلاً 40px أو 60px)
                  height: "50px", // يجب أن تكون مطابقة للعرض لضمان شكل دائري مثالي
                  objectFit: "cover", // لضمان عدم تشوه الصورة إذا كانت أبعادها غير متساوية
                  border: "2px solid #facc15",
                }}
              />
            )}

            <div style={{ fontSize: "14px" }}>
              <div>
                <strong className="text-warning">Name:</strong> {user.name}
              </div>
              {userType === "student" && (
                <>
                  <div>
                    <strong className="text-warning">Points:</strong>{" "}
                    {user.points}
                  </div>
                  <div>
                    <strong className="text-warning">Level:</strong>{" "}
                    {user.level} {user.subLevel}
                  </div>
                </>
              )}
              {userType === "teacher" && (
                <div>
                  <strong className="text-warning">Stars:</strong>{" "}
                  {user.NumStars > 0
                    ? Array.from({ length: user.NumStars }).map((_, i) => (
                        <span key={i} style={{ color: "#facc15" }}>
                          ⭐
                        </span>
                      ))
                    : "No stars yet 🧑🏻‍🏫"}
                </div>
              )}
              <div>
                <strong className="text-warning">Status:</strong>{" "}
                {isOnline(user) ? "🟢 Online" : "🔴 Offline"}
              </div>
            </div>

            <button
              className="btn ms-3 fw-bold arcade-button-red"
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                boxShadow: "0 0 10px #ef4444",
              }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid dashboard-stage py-4 px-3 px-md-4 px-xl-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xxl-11 text-center">
            <div className="dashboard-shell p-4 p-md-5 rounded">
              <h1
                className="fw-bold mb-4 arcade-font"
                style={{
                  fontSize: "27px",
                  letterSpacing: "4px",
                  color: "#facc15",
                  textShadow: "0 0 15px rgba(250, 204, 21, 0.5)",
                }}>
                {userType === "student"
                  ? "STUDENT'S COMMAND CENTER"
                  : "TEACHER'S HUB"}
              </h1>
              <p className="text-light fs-5 mb-5">
                Welcome to the Examina Arcade Dashboard 🚀
              </p>

              <div className="dashboard-grid">
                {/* --- STUDENT VIEW --- */}
                {userType === "student" && (
                  <>
                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 category-hover-effect d-flex flex-column"
                        onClick={() => navigate("/categories")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #facc15",
                          background: "rgba(30, 58, 138, 0.4)",
                          transition: "0.3s",
                        }}>
                        <div style={{ fontSize: "60px" }} className="mb-3">
                          📝
                        </div>
                        <h3 className="arcade-title text-warning">
                          ENROLL EXAM
                        </h3>
                        <p className="text-light small">
                          Choose your category, defeat the questions, and rank
                          up!
                        </p>
                        <div className="mt-auto">
                          <button className="btn btn-warning fw-bold w-100 shadow arcade-font-btn">
                            START MISSION
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/challenges-list")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #a855f7",
                          background: "rgba(88, 28, 135, 0.4)",
                          boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                          transition: "0.3s",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🔥
                        </div>
                        <h3
                          className="arcade-title text-center"
                          style={{ color: "#d8b4fe" }}>
                          CHALLENGES
                        </h3>
                        <p className="text-light small text-center">
                          Face boss-level missions and earn massive rewards!
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn fw-bold w-100 shadow arcade-font-btn"
                            style={{
                              backgroundColor: "#a855f7",
                              color: "white",
                              border: "none",
                              height: "50px",
                            }}>
                            ENTER ARENA
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/chaos-mode")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #f43f5e",
                          background: "rgba(136, 19, 55, 0.35)",
                          boxShadow: "0 0 15px rgba(244, 63, 94, 0.3)",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🃏
                        </div>
                        <h3
                          className="arcade-title text-center"
                          style={{ color: "#fb7185" }}>
                          CHAOS MODE
                        </h3>
                        <p className="text-light small text-center">
                          Draw a random card and twist your mission rules.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn w-100 fw-bold"
                            style={{ background: "#f43f5e", color: "#fff" }}>
                            ENTER CHAOS
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/achievements")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #facc15",
                          background: "rgba(66, 32, 6, 0.4)",
                          boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
                          transition: "0.3s",
                          position: "relative",
                        }}>
                        {hasNewAchievement && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow">
                            NEW
                          </span>
                        )}
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🏆
                        </div>
                        <h3 className="arcade-title text-warning text-center">
                          MY TROPHIES
                        </h3>
                        <p className="text-light small text-center">
                          Track your personal milestones and earned badges.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn btn-warning fw-bold w-100 shadow arcade-font-btn"
                            style={{ height: "50px" }}>
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/leaderboard")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #eeeeee",
                          background: "rgba(48, 39, 36, 0.4)",
                          boxShadow: "0 0 15px rgba(21, 74, 250, 0.3)",
                          transition: "0.3s",
                          position: "relative",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🥇
                        </div>
                        <h3 className="arcade-title text-warning text-center">
                          MY RANK
                        </h3>
                        <p className="text-light small text-center">
                          Track your personal rank figth for the 1&apos;th place
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn btn-warning fw-bold w-100 shadow arcade-font-btn"
                            style={{ height: "50px" }}>
                            Leader Board
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 category-hover-effect d-flex flex-column"
                        onClick={() => navigate("/my-profile")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #b1afa7",
                          background: "rgba(30, 58, 138, 0.4)",
                          transition: "0.3s",
                        }}>
                        <div style={{ fontSize: "60px" }} className="mb-3">
                          🛟
                        </div>
                        <h3 className="arcade-title text-warning">
                          Player Profile
                        </h3>
                        <p className="text-light small">
                          Create , Manage Enhance your profile so other players
                          can know you
                        </p>
                        <div className="mt-auto">
                          <button className="btn btn-warning fw-bold w-100 shadow arcade-font-btn">
                            Enter Safe Zone
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* --- TEACHER VIEW --- */}
                {userType === "teacher" && (
                  <>
                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/questions")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #ef4444",
                          background: "rgba(127, 29, 29, 0.4)",
                          boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          ⚙️
                        </div>
                        <h3 className="arcade-title text-danger text-center">
                          MISSION CONTROL
                        </h3>
                        <p className="text-light small text-center">
                          Manage your question database and create new missions.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn btn-danger fw-bold w-100 shadow arcade-font-btn"
                            style={{ height: "50px" }}>
                            MANAGE QUESTIONS
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/teacher-challenges")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #06b6d4",
                          background: "rgba(8, 51, 68, 0.4)",
                          boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🚀
                        </div>
                        <h3
                          className="arcade-title text-center"
                          style={{ color: "#06b6d4" }}>
                          QUEST GRID
                        </h3>
                        <p className="text-light small text-center">
                          Deploy new challenges and set point requirements.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn fw-bold w-100 shadow arcade-font-btn"
                            style={{
                              backgroundColor: "#06b6d4",
                              color: "white",
                              border: "none",
                              height: "50px",
                            }}>
                            MANAGE CHALLENGES
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/teacher-students-search")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #22c55e",
                          background: "rgba(6, 78, 59, 0.4)",
                          boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)",
                          transition: "0.3s",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🔎
                        </div>
                        <h3
                          className="arcade-title text-center"
                          style={{ color: "#4ade80" }}>
                          STUDENT RADAR
                        </h3>
                        <p className="text-light small text-center">
                          Search any student by ID, name, or email and view
                          their status quickly.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn fw-bold w-100 shadow arcade-font-btn"
                            style={{
                              backgroundColor: "#22c55e",
                              color: "white",
                              border: "none",
                              height: "50px",
                            }}>
                            SEARCH STUDENTS
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/teacher-teachers-search")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #38bdf8",
                          background: "rgba(7, 89, 133, 0.35)",
                          boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
                          transition: "0.3s",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🧑🏻‍🏫
                        </div>
                        <h3
                          className="arcade-title text-center"
                          style={{ color: "#7dd3fc" }}>
                          TEACHER RADAR
                        </h3>
                        <p className="text-light small text-center">
                          Search teachers by ID, name, or email and monitor
                          their status.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn fw-bold w-100 shadow arcade-font-btn"
                            style={{
                              backgroundColor: "#0ea5e9",
                              color: "white",
                              border: "none",
                              height: "50px",
                            }}>
                            SEARCH TEACHERS
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-4">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/achievements")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #facc15",
                          background: "rgba(66, 32, 6, 0.4)",
                          boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🏆
                        </div>
                        <h3 className="arcade-title text-warning text-center">
                          MY TROPHIES
                        </h3>
                        <p className="text-light small text-center">
                          Track your personal teaching milestones.
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn btn-warning fw-bold w-100 shadow arcade-font-btn"
                            style={{ height: "50px" }}>
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 d-flex flex-column category-hover-effect"
                        onClick={() => navigate("/leaderboard")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #eeeeee",
                          background: "rgba(48, 39, 36, 0.4)",
                          boxShadow: "0 0 15px rgba(21, 74, 250, 0.3)",
                          transition: "0.3s",
                          position: "relative",
                        }}>
                        <div
                          style={{ fontSize: "60px" }}
                          className="mb-3 text-center">
                          🥇
                        </div>
                        <h3 className="arcade-title text-warning text-center">
                          MY RANK
                        </h3>
                        <p className="text-light small text-center">
                          Track your personal rank figth for the 1&apos;th place
                        </p>
                        <div className="mt-auto">
                          <button
                            className="btn btn-warning fw-bold w-100 shadow arcade-font-btn"
                            style={{ height: "50px" }}>
                            Leader Board
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 grid-span-6">
                      <div
                        className="arcade-card p-4 h-100 category-hover-effect d-flex flex-column"
                        onClick={() => navigate("/my-profile")}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #b1afa7",
                          background: "rgba(30, 58, 138, 0.4)",
                          transition: "0.3s",
                        }}>
                        <div style={{ fontSize: "60px" }} className="mb-3">
                          🛟
                        </div>
                        <h3 className="arcade-title text-warning">
                          Player Profile
                        </h3>
                        <p className="text-light small">
                          Create , Manage Enhance your profile so other players
                          can know you
                        </p>
                        <div className="mt-auto">
                          <button className="btn btn-warning fw-bold w-100 shadow arcade-font-btn">
                            Enter Safe Zone
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
