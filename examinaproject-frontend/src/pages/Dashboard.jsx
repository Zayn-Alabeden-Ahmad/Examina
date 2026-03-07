import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Dashboard.css";
import "./arcade.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  // 1. دالة عرض تنبيهات الإنجازات بتنسيق الأركيد
  const showAchievementAlerts = async (achievements) => {
    for (const ach of achievements) {
      await Swal.fire({
        title: "ACHIEVEMENT UNLOCKED! 🏆",
        html: `
          <div class="arcade-font" style="color: #fff; text-align: center;">
            <h4 style="color: #facc15; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">${ach.name}</h4>
            <p style="font-size: 0.9rem; line-height: 1.5; color: #e2e8f0;">${ach.description}</p>
          </div>
        `,
        imageUrl:
          ach.image ||
          "https://cdn-icons-png.flaticon.com/512/1904/1904425.png",
        imageWidth: 120,
        imageHeight: 120,
        background: "#0f172a",
        confirmButtonText: "COLLECT REWARD",
        confirmButtonColor: "#facc15",
        buttonsStyling: true,
        backdrop: `rgba(15, 23, 42, 0.9)`,
        customClass: {
          popup: "arcade-border-gold",
          title: "text-warning arcade-font",
        },
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // طلب البيانات من السيرفر
        const res = await api.get("/home/");

        // طباعة البيانات في الكونسول للتأكد من وصول new_achievements
        console.log("Dashboard Data:", res.data);

        // استخراج بيانات المستخدم (حسب هيكلة الـ JSON الخاص بك)
        const userData = res.data.user_data || res.data;
        setUser(userData);

        // تحديد نوع المستخدم (طالب أم مدرس)
        if (userData.points !== undefined || userData.role === "student") {
          setUserType("student");
        } else {
          setUserType("teacher");
        }

        // 2. التحقق من الإنجازات الجديدة التي لم يتم الإخطار بها بعد
        const achievements = res.data.new_achievements;
        if (achievements && achievements.length > 0) {
          showAchievementAlerts(achievements);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchData();
  }, []);

  // حالة التحميل
  if (!user) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light arcade-font">
        LOADING DATA...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await api.post("/logout/", { refresh });
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  const PrintStars = (starsCount) => {
    let stars = "";
    for (let i = 0; i < starsCount; i++) {
      stars += "⭐";
    }
    return stars;
  };

  return (
    <div
      className="dashboard-page min-vh-100 text-white"
      style={{
        background: "linear-gradient(to bottom, #0f172a, #1e3a8a, #2563eb)",
      }}>
      {/* Navbar Section */}
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

          <div className="d-flex align-items-center bg-dark bg-opacity-75 p-3 rounded border border-warning shadow">
            {user.profile_picture && (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="rounded-circle me-3"
                style={{
                  width: "50px",
                  height: "50px",
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
                  <strong className="text-warning">Star Level:</strong>{" "}
                  {user.NumStars > 0 ? PrintStars(user.NumStars) : "🧑🏻‍🏫"}
                </div>
              )}
              <div>
                <strong className="text-warning">Status:</strong>{" "}
                {user.status ? "🟢 Online" : "🔴 Offline"}
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

      {/* Main Content Area */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 text-center">
            <div
              className="p-5 rounded"
              style={{
                background: "rgba(2,6,23,0.9)",
                border: "3px solid #facc15",
                boxShadow: "0 0 25px #facc15",
              }}>
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

              <div className="row g-4 justify-content-center">
                {userType === "student" && (
                  <div className="col-md-6">
                    <div
                      className="arcade-card p-4 h-100 category-hover-effect"
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
                      <h3 className="arcade-title text-warning">ENROLL EXAM</h3>
                      <p className="text-light small">
                        Choose your category, defeat the questions, and rank up!
                      </p>
                      <button className="btn btn-warning fw-bold mt-3 w-100 shadow">
                        START MISSION
                      </button>
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <div
                    className="arcade-card p-4 h-100 shadow-sm"
                    style={{
                      border: "2px solid #6366f1",
                      background: "rgba(2, 6, 23, 0.6)",
                    }}>
                    <div style={{ fontSize: "60px" }} className="mb-3">
                      🏆
                    </div>
                    <h3 className="arcade-title" style={{ color: "#6366f1" }}>
                      {userType === "student"
                        ? "MY ACHIEVEMENTS"
                        : "MY QUESTIONS"}
                    </h3>
                    <p className="text-light small">
                      {userType === "student"
                        ? "Check your unlocked badges and rewards."
                        : "Manage and track your students progress."}
                    </p>
                    <button className="btn btn-outline-primary fw-bold mt-3 w-100">
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
