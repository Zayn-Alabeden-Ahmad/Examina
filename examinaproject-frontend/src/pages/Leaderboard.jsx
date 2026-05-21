import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentLeaderboard,
  getTeacherLeaderboard,
} from "../api/apiService";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [isStudentTab, setIsStudentTab] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = isStudentTab
          ? await getStudentLeaderboard()
          : await getTeacherLeaderboard();
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isStudentTab]);

  const getStatusValue = (obj) => obj?.status ?? obj?.Status ?? "";
  const isOnline = (obj) => {
    const s = String(getStatusValue(obj)).trim().toLowerCase();
    return s === "active" || s === "online" || s === "true" || s === "1";
  };

  return (
    <div className="container-fluid bg-dark min-vh-100 py-5 font-monospace text-light">
      {/* Title Section */}
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold text-uppercase tracking-wider arcade-title">
          HALL OF FAME
        </h1>
        <p className="text-secondary small mt-2">
          INSERT COIN TO CONTINUE // LEVEL UP
        </p>
      </div>
      <div className="position-absolute top-0 start-0 p-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-outline-info border-2 fw-bold text-uppercase arcade-back-btn">
          <span className="me-2">{"<"}</span> Return_to_Nexus
        </button>
      </div>
      {/* Toggle Tabs */}
      <div className="d-flex justify-center mb-4">
        <div className="btn-group mx-auto border border-secondary p-1 rounded-3 bg-black">
          <button
            onClick={() => setIsStudentTab(true)}
            className={`btn btn-lg px-5 fw-bold text-uppercase ${isStudentTab ? "btn-info shadow-glow" : "btn-outline-dark text-secondary border-0"}`}>
            Students
          </button>
          <button
            onClick={() => setIsStudentTab(false)}
            className={`btn btn-lg px-5 fw-bold text-uppercase ${!isStudentTab ? "btn-primary shadow-glow-purple" : "btn-outline-dark text-secondary border-0"}`}>
            Teachers
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card bg-black border-secondary shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-dark border-secondary py-3">
              <div className="row text-uppercase fw-bold text-secondary small text-center">
                <div className="col-2">Rank</div>
                <div className="col-6 text-start">Player</div>
                <div className="col-4">Score / Stats</div>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-info" role="status"></div>
                  <p className="mt-3 text-info fw-bold animate-flicker">
                    LOADING SYSTEM...
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush bg-transparent">
                  {data.map((user, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        const userId = isStudentTab
                          ? user.StudentID
                          : user.TeacherID;
                        const userType = isStudentTab ? "student" : "teacher";
                        navigate(`/profile/${userType}/${userId}`);
                      }}
                      className={`list-group-item bg-transparent border-secondary py-4 px-3 arcade-row ${index < 3 ? "top-rank" : ""}`}
                      style={{ cursor: "pointer" }}>
                      <div className="row align-items-center text-center">
                        {/* Rank */}
                        <div className="col-2">
                          <span
                            className={`h2 fw-black ${index === 0 ? "text-warning" : index === 1 ? "text-light" : index === 2 ? "text-danger" : "text-secondary"}`}>
                            {index + 1}
                          </span>
                        </div>

                        {/* Player Info Section */}
                        <div className="col-6 text-start d-flex align-items-center">
                          <div className="position-relative">
                            <img
                              src={
                                user.profile_pic
                                  ? `http://localhost:8000${user.profile_pic}`
                                  : "https://via.placeholder.com/50"
                              }
                              className={`rounded-3 border border-2 ${index === 0 ? "border-warning" : "border-secondary"}`}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                              alt="avatar"
                            />
                          </div>

                          <div className="ms-3">
                            <h5 className="mb-0 fw-bold text-uppercase player-name">
                              {index === 0 && (
                                <span className="crown-gap">👑</span>
                              )}
                              {user.first_name} {user.last_name}
                            </h5>

                            <small className="text-secondary tracking-tighter text-uppercase">
                              {isStudentTab
                                ? `LVL: ${user.level_name}`
                                : `${user.Description || "ELITE TEACHER"}`}
                            </small>

                            <small
                              className="d-block text-uppercase fw-bold"
                              style={{
                                color: isOnline(user) ? "#22c55e" : "#ef4444",
                                fontSize: "0.65rem",
                              }}>
                              {isOnline(user) ? "Online" : "Offline"}
                            </small>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="col-4">
                          {isStudentTab ? (
                            <div className="d-flex flex-column align-items-end pe-3">
                              <span className="h4 mb-0 text-info fw-black">
                                {user.StudentPoints}
                              </span>
                              <span
                                className="small text-secondary fw-bold text-uppercase"
                                style={{ fontSize: "0.6rem" }}>
                                XP Points
                              </span>
                            </div>
                          ) : (
                            <div className="d-flex flex-column align-items-end pe-3">
                              <span className="h4 mb-0 text-warning fw-black">
                                {user.num_stars}★
                              </span>
                              <span
                                className="small text-secondary fw-bold text-uppercase"
                                style={{ fontSize: "0.6rem" }}>
                                Stars
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer
        className="mt-5 text-center text-secondary small text-uppercase"
        style={{ letterSpacing: "5px" }}>
        &copy; 2026 Examina Leaders // Examina v1.0
      </footer>
    </div>
  );
};

export default Leaderboard;
