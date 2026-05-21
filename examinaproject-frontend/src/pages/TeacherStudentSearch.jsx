import { useEffect, useState } from "react";
import { searchStudents } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import "./arcade.css";
import "./ManageQuestions.css";

export default function TeacherStudentSearch() {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isOnline = (status) => {
    const s = String(status || "")
      .trim()
      .toLowerCase();
    return s === "active" || s === "online" || s === "1" || s === "true";
  };

  const fetchStudents = async (value = "") => {
    setLoading(true);
    try {
      const res = await searchStudents(value);
      setStudents(res.data || []);
    } catch (err) {
      console.error("Student search failed:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents("");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div
      className="manage-questions-page min-vh-100 p-4"
      style={{ background: "linear-gradient(to bottom, #020617, #0f172a)" }}>
      <div className="container bg-dark bg-opacity-75 p-4 rounded border-arcade shadow-lg">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-warning pb-2">
          <div>
            <h2 className="arcade-font text-warning mb-1">STUDENT RADAR</h2>
            <p className="text-info mb-0 small">
              Track students by ID, name, or email
            </p>
          </div>
          <button
            className="btn btn-outline-warning arcade-font-small"
            onClick={() => navigate("/dashboard")}
            style={{ borderWidth: "2px" }}>
            ⬅ BACK
          </button>
        </div>

        <div
          className="p-3 rounded mb-3"
          style={{
            background: "rgba(2, 6, 23, 0.75)",
            border: "1px solid rgba(250, 204, 21, 0.25)",
          }}>
          <label className="text-info arcade-font-small d-block mb-2">
            SEARCH STUDENT
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
              You can search by <strong>Student ID</strong>,{" "}
              <strong>First Name</strong>,<strong> Last Name</strong>, or{" "}
              <strong>Email</strong>.
              <br />
              Examples: <span className="text-warning">12</span>,{" "}
              <span className="text-warning">ahmad</span>,{" "}
              <span className="text-warning">gmail.com</span>.
            </div>
          </div>

          <small className="text-secondary d-block mt-2">
            Live scan updates while typing...
          </small>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
            <p className="mt-3 text-info arcade-font-small">
              SCANNING DATABASE...
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover arcade-table align-middle">
              <thead>
                <tr className="text-info">
                  <th>ID</th>
                  <th>PLAYER</th>
                  <th>EMAIL</th>
                  <th>LEVEL</th>
                  <th>XP</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.StudentID}>
                    <td className="text-secondary arcade-font-small fw-bold">
                      #{s.StudentID}
                    </td>

                    <td>
                      <span className="fw-bold text-light">
                        {s.first_name} {s.last_name}
                      </span>
                    </td>
                    <td className="text-secondary">{s.email}</td>
                    <td>
                      <span className="badge border border-info text-info">
                        {s.level_name || "UNRANKED"}
                      </span>
                    </td>
                    <td className="text-cyan fw-bold">{s.student_points}</td>
                    <td>
                      <span
                        className={`badge ${
                          isOnline(s.status) ? "bg-success" : "bg-danger"
                        }`}>
                        {isOnline(s.status) ? "🟢 ONLINE" : "🔴 OFFLINE"}
                      </span>
                    </td>
                  </tr>
                ))}

                {students.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-secondary py-4">
                      NO STUDENTS MATCH YOUR SCAN
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
