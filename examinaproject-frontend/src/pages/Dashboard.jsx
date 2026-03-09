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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/home/");
        const userData = res.data.user_data || res.data;
        setUser(userData);

        if (res.data.has_new_achievements) {
          setHasNewAchievement(true);
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

  // --- التعديل المطلوب: دالة عرض النجوم بحد أقصى 5 ---
  const RenderStarLevel = (numStars) => {
    return (
      <div className="d-inline-flex gap-1 align-items-center">
        {[1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            style={{
              fontSize: "18px",
              // إذا كان رقم النجمة الحالي أقل أو يساوي عدد نجوم المستخدم تظهر ملونة
              filter:
                index <= numStars
                  ? "grayscale(0%)"
                  : "grayscale(100%) opacity(0.3)",
              transition: "0.3s",
            }}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className="dashboard-page min-vh-100 text-white"
      style={{
        background: "linear-gradient(to bottom, #0f172a, #1e3a8a, #2563eb)",
      }}>
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
                  <strong className="text-warning">Stars:</strong>{" "}
                  {
                    user.NumStars > 0
                      ? // تكرار رمز النجمة بناءً على الرقم القادم من السيرفر
                        Array.from({ length: user.NumStars }).map((_, i) => (
                          <span key={i} style={{ color: "#facc15" }}>
                            ⭐
                          </span>
                        ))
                      : "No stars yet 🧑🏻‍🏫" // في حالة StarID 13
                  }
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
                      position: "relative",
                    }}>
                    {hasNewAchievement && (
                      <span
                        className="red-dot" /* استخدام الكلاس المعرف في CSS للنبض */
                        style={{
                          position: "absolute",
                          top: "15px",
                          right: "15px",
                          width: "14px",
                          height: "14px",
                          backgroundColor: "#ef4444",
                          borderRadius: "50%",
                          boxShadow: "0 0 12px #ef4444",
                          border: "2px solid white",
                        }}
                      />
                    )}

                    <div style={{ fontSize: "60px" }} className="mb-3">
                      🏆
                    </div>
                    <h3 className="arcade-title" style={{ color: "#6366f1" }}>
                      {userType === "student"
                        ? "MY ACHIEVEMENTS"
                        : "MY TROPHIES"}
                    </h3>
                    <p className="text-light small">
                      {userType === "student"
                        ? "Check your unlocked badges and rewards."
                        : "track your achievements."}
                    </p>
                    <button
                      className="btn btn-outline-primary fw-bold mt-3 w-100"
                      onClick={() => navigate("/achievements")}>
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
