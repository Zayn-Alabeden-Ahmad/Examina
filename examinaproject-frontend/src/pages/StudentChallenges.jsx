import { useEffect, useState } from "react";
import { getStudentChallenges } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./arcade.css";

export default function StudentChallenges() {
  const [challenges, setChallenges] = useState([]);
  const studentId = localStorage.getItem("studentId");
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) fetchChallenges();
  }, [studentId]);

  const fetchChallenges = async () => {
    try {
      const res = await getStudentChallenges(studentId);
      setChallenges(res.data);
    } catch (err) {
      console.error("Failed to load challenges", err);
    }
  };

  const startMission = (challenge) => {
    if (!challenge.IsUnlocked) {
      Swal.fire({
        title: "ACCESS DENIED",
        text: `Required: ${challenge.MinPointsRequired} XP!`,
        icon: "warning",
        background: "#1e1b4b",
        color: "#ef4444",
      });
      return;
    }

    Swal.fire({
      title: "START MISSION?",
      text: `Challenge: ${challenge.ChallengeName}`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "ENGAGE",
      background: "#0f172a",
      color: "#facc15",
      confirmButtonColor: "#facc15",
    }).then((result) => {
      if (result.isConfirmed) {
        // تأكد أن App.js يحتوي على مسار /mission/:challengeId
        navigate(`/mission/${challenge.ChallengeExamID}`);
      }
    });
  };
  const handleAbort = () => {
    Swal.fire({
      title: "ABORT MISSION?",
      text: "Your progress will be lost!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "YES, RETREAT",
      background: "#1e293b",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard");
      }
    });
  };
  return (
    <div className="min-vh-100 p-5" style={{ background: "#020617" }}>
      <h1 className="arcade-font text-center text-warning mb-5">
        AVAILABLE MISSIONS
      </h1>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="text-warning m-0">MISSION IN PROGRESS...</h2>
        <button
          className="btn btn-outline-danger arcade-font"
          onClick={handleAbort}>
          × ABORT
        </button>
      </div>
      <div className="row g-4">
        {challenges.map((ch) => (
          <div key={ch.ChallengeExamID} className="col-md-4">
            <div
              className={`p-4 rounded border-3 ${ch.IsUnlocked ? "border-warning" : "border-secondary opacity-50"}`}
              style={{
                background: "rgba(30, 41, 59, 0.7)",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => startMission(ch)}>
              {!ch.IsUnlocked && (
                <div
                  style={{ position: "absolute", top: "10px", right: "10px" }}>
                  🔒
                </div>
              )}
              <h3 className="arcade-font text-white small">
                {ch.ChallengeName}
              </h3>
              <p className="text-secondary x-small">{ch.Description}</p>
              <div className="mt-3 d-flex justify-content-between">
                <span className="text-info arcade-font x-small">
                  {ch.MinPointsRequired} XP
                </span>
                <span className="text-danger arcade-font x-small">
                  Penalty: {ch.PenaltyPoints}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
