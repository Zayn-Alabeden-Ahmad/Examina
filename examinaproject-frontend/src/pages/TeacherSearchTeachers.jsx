import { useEffect, useState } from "react";
import { searchTeachers } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import "./arcade.css";
import "./ManageQuestions.css";

export default function TeacherSearchTeachers() {
  const [q, setQ] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isOnline = (status) => {
    const s = String(status || "")
      .trim()
      .toLowerCase();
    return s === "active" || s === "online" || s === "1" || s === "true";
  };

  const fetchTeachers = async (value = "") => {
    setLoading(true);
    try {
      const res = await searchTeachers(value);
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Teacher search failed:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers("");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchTeachers(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="manage-questions-page min-vh-100 p-4">
      <div className="container bg-dark bg-opacity-75 p-4 rounded border-arcade shadow-lg">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-warning pb-2">
          <h2 className="arcade-font text-warning mb-0">TEACHER RADAR</h2>
          <button
            className="btn btn-outline-warning arcade-font-small"
            onClick={() => navigate("/dashboard")}>
            ⬅ BACK
          </button>
        </div>

        <label className="text-info arcade-font-small d-block mb-2">
          SEARCH TEACHER
        </label>
        <input
          className="form-control"
          placeholder="ID / first name / last name / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="search-help-wrap mt-2" style={{ maxWidth: "700px" }}>
          <span className="search-help-trigger arcade-font-small">
            ⓘ SEARCH HELP
          </span>
          <div className="search-help-tooltip">
            You can search by <strong>Teacher ID</strong>,{" "}
            <strong>First Name</strong>,<strong> Last Name</strong>, or{" "}
            <strong>Email</strong>.
          </div>
        </div>

        {loading ? (
          <div className="text-info mt-4">SCANNING...</div>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-dark table-hover arcade-table">
              <thead>
                <tr className="text-info">
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STARS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.TeacherID}>
                    <td
                      className="arcade-font-small fw-bold"
                      style={{ color: "#cbd5e1" }}>
                      #{t.TeacherID}
                    </td>
                    <td>
                      {t.first_name} {t.last_name}
                    </td>
                    <td style={{ color: "#94a3b8" }}>{t.email}</td>
                    <td>
                      {t.num_stars > 0 ? (
                        Array.from({ length: t.num_stars }).map((_, i) => (
                          <span key={i} style={{ color: "#facc15" }}>
                            ⭐
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#94a3b8" }}>No stars</span>
                      )}
                    </td>
                    <td>{isOnline(t.status) ? "🟢 Online" : "🔴 Offline"}</td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary">
                      NO TEACHERS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
