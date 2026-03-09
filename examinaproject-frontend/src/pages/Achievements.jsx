import React, { useEffect, useState } from "react";
import api from "../api/apiService";
import { useNavigate } from "react-router-dom";
import "./Achievements.css";
import "./arcade.css";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // نستخدم الرابط الجديد الذي أنشأناه في الـ Backend
        const res = await api.get("/achievements/my-achievements/");
        setAchievements(res.data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light arcade-font">
        SCANNING DATABASE FOR TROPHIES...
      </div>
    );
  }

  return (
    <div className="achievements-page min-vh-100 text-white py-5">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3 border-primary">
          <div>
            <h1 className="arcade-title text-warning mb-0">HALL OF FAME</h1>
            <p className="text-info mb-0">
              Your legendary milestones and badges
            </p>
          </div>
          <button
            className="btn arcade-button-red px-4"
            onClick={() => navigate("/dashboard")}>
            RETURN TO BASE
          </button>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "80px" }}>🌑</div>
            <h3 className="arcade-font text-muted mt-3">
              NO ACHIEVEMENTS UNLOCKED YET
            </h3>
            <p className="text-light">
              Keep completing missions to earn your place here!
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {achievements.map((item) => (
              <div key={item.UserAchievementID} className="col-lg-4 col-md-6">
                <div className="achievement-card">
                  <div className="card-inner p-4">
                    {/* Achievement Icon/Image */}
                    <div className="icon-wrapper mb-3 text-center">
                      <img
                        src={
                          item.achievement_details.Image ||
                          "https://via.placeholder.com/100"
                        }
                        alt={item.achievement_details.Name}
                        className="achievement-img shadow-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h4 className="achievement-name text-warning arcade-font-small">
                        {item.achievement_details.Name}
                      </h4>
                      <p className="achievement-desc text-light-50 small mb-3">
                        {item.achievement_details.Description}
                      </p>

                      <div className="date-earned mt-auto">
                        <span className="badge bg-dark border border-primary text-primary px-3">
                          EARNED ON:{" "}
                          {new Date(item.DateEarned).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Arcade Decoration */}
                    <div className="corner-decor top-right"></div>
                    <div className="corner-decor bottom-left"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
