import { useEffect, useState } from "react";
import api, { getLevels, createChallenge } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./arcade.css";
import Swal from "sweetalert2";
export default function TeacherChallenges() {
  const [levels, setLevels] = useState([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [extraPoints, setExtraPoints] = useState(10); // القيمة الافتراضية 10
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ChallengeName: "",
    Description: "",
    PenaltyPoints: 5, // إعادة الـ Penalty
  });

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await getLevels();
        setLevels(res.data);
        if (res.data.length > 0) setLevelIndex(0);
        setLoading(false);
      } catch (err) {
        console.error("Error loading levels:", err);
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  const selectedLevel = levels[levelIndex] || null;

  const showArcadeAlert = (title, text, icon) => {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      background: "#0f172a", // لون غامق متناسق مع تصميمك
      color: "#facc15", // لون النص ذهبي
      confirmButtonColor: "#facc15",
      confirmButtonText: "UNDERSTOOD",
      customClass: {
        popup: "arcade-border", // يمكنك إضافة ستايل خاص في CSS
        title: "arcade-font-swal",
      },
    });
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!selectedLevel || !formData.ChallengeName) {
      alert("⚠️ PLEASE SELECT A DIFFICULTY TIER AND NAME YOUR MISSION!");
      return;
    }

    const finalMinPoints =
      parseInt(selectedLevel.MinPointsRequired) + parseInt(extraPoints);

    const payload = {
      ...formData,
      MinPointsRequired: finalMinPoints,
    };

    try {
      await createChallenge(payload);

      Swal.fire({
        title: "MISSION DEPLOYED!",
        text: "THE NEW CHALLENGE IS NOW LIVE ON THE GRID.",
        icon: "success",
        background: "#0f172a",
        color: "#10b981", // أخضر للنجاح
        confirmButtonColor: "#10b981",
        timer: 3000,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Deployment failed:", err);
      showArcadeAlert(
        "SYSTEM ERROR",
        "DEPLOYMENT FAILED. CHECK YOUR CONNECTION.",
        "error",
      );
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light arcade-font">
        INITIALIZING...
      </div>
    );

  return (
    <div
      className="dashboard-page min-vh-100 text-white"
      style={{ background: "linear-gradient(to bottom, #0f172a, #1e1b4b)" }}>
      <div
        className="container-fluid py-3"
        style={{ borderBottom: "3px solid #facc15" }}>
        <div
          className="fw-bold text-warning arcade-font"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}>
          ⬅️ RETURN TO COMMAND CENTER
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div
              className="p-4 rounded"
              style={{
                background: "rgba(2,6,23,0.98)",
                border: "2px solid #facc15",
              }}>
              <h2
                className="arcade-font text-center text-warning mb-4"
                style={{ fontSize: "22px" }}>
                QUEST CONSTRUCTOR
              </h2>

              <form onSubmit={handleDeploy} className="row g-3">
                <div className="col-12">
                  <label className="text-warning arcade-font x-small mb-1">
                    MISSION TITLE
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ChallengeName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="text-warning arcade-font x-small mb-1">
                    MISSION BRIEFING
                  </label>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="2"
                    onChange={(e) =>
                      setFormData({ ...formData, Description: e.target.value })
                    }
                  />
                </div>

                <hr className="border-secondary my-4" />

                {/* Level Selection */}
                <div className="col-12 text-center">
                  <label className="text-info arcade-font small mb-3">
                    DIFFICULTY TIER SELECTOR
                  </label>
                  <div
                    className="mb-3 p-3 rounded border border-info"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="arcade-font text-white fs-4">
                      {selectedLevel?.LevelName}
                    </div>
                    <div className="text-info arcade-font x-small">
                      SUB-LEVEL: {selectedLevel?.subLevel}
                    </div>
                  </div>
                  <input
                    type="range"
                    className="form-range w-100"
                    min="0"
                    max={levels.length - 1}
                    value={levelIndex}
                    onChange={(e) => setLevelIndex(parseInt(e.target.value))}
                    style={{ accentColor: "#0ea5e9" }}
                  />
                </div>

                {/* Extra Difficulty Offset (10-50, step 10) */}
                <div className="col-12 mt-4">
                  <label className="text-warning arcade-font x-small mb-2">
                    EXTRA DIFFICULTY OFFSET: +{extraPoints} PTS
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="50"
                    step="10"
                    value={extraPoints}
                    onChange={(e) => setExtraPoints(e.target.value)}
                    style={{ accentColor: "#facc15" }}
                  />
                  <div className="d-flex justify-content-between x-small text-secondary arcade-font">
                    <span>10</span>
                    <span>20</span>
                    <span>30</span>
                    <span>40</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Failure Penalty */}
                <div className="col-12 mt-3">
                  <label className="text-danger arcade-font x-small mb-2">
                    FAILURE PENALTY: {formData.PenaltyPoints} PTS
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="25"
                    value={formData.PenaltyPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        PenaltyPoints: e.target.value,
                      })
                    }
                    style={{ accentColor: "#ef4444" }}
                  />
                </div>

                {/* Final Calculation */}
                <div className="col-12 mt-4 text-center">
                  <div
                    className="p-3 rounded"
                    style={{
                      background: "#1e293b",
                      border: "1px dashed #0ea5e9",
                    }}>
                    <div className="text-info arcade-font x-small mb-1">
                      FINAL UNLOCK THRESHOLD
                    </div>
                    <div className="fs-3 arcade-font">
                      {parseInt(selectedLevel?.MinPointsRequired || 0) +
                        parseInt(extraPoints)}{" "}
                      <small className="fs-6 text-warning">XP</small>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning arcade-font w-100 py-3 mt-4 fw-bold">
                  DEPLOY MISSION ⚡
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
