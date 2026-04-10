import React, { useEffect, useState } from "react";
import api from "../api/apiService";
import { useNavigate } from "react-router-dom"; // إضافة الاستيراد
import "./ManageQuestions.css";
import "./arcade.css";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const navigate = useNavigate(); // تعريف الـ navigate

  const [formData, setFormData] = useState({
    QuestionName: "",
    QuestionText: "",
    Category: "",
    Rate: 100,
    Points: 10,
    QuestionType: "Regular",
    answers: [
      { AnswerText: "", IsCorrect: true },
      { AnswerText: "", IsCorrect: false },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        api.get("/myquestions/"),
        api.get("/exams/category/"),
      ]);

      setQuestions(qRes.data.questions);
      setCategories(cRes.data);

      if (cRes.data.length > 0 && !formData.Category) {
        setFormData((prev) => ({
          ...prev,
          Category: cRes.data[0].CategoryName,
        }));
      }
    } catch (err) {
      console.error("Critical: Sync Error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentQuestion) {
        await api.put(
          `/questions/${currentQuestion.QuestionID}/update/`,
          formData,
        );
      } else {
        await api.post("/addquestion/", formData);
      }
      setShowModal(false);
      loadData();
      resetForm();
    } catch (err) {
      alert("MISSION CORE FAILURE - CHECK CONSOLE");
    }
  };

  const handleDelete = async (pk) => {
    if (window.confirm("ARE YOU SURE YOU WANT TO TERMINATE THIS MISSION?")) {
      try {
        await api.delete(`/questions/${pk}/delete/`);
        setQuestions(questions.filter((q) => q.QuestionID !== pk));
      } catch (err) {
        alert("TERMINATION FAILED");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      QuestionName: "",
      QuestionText: "",
      Category: categories[0]?.CategoryName || "",
      Rate: 100,
      Points: 10,
      QuestionType: "Regular",
      answers: [
        { AnswerText: "", IsCorrect: true },
        { AnswerText: "", IsCorrect: false },
      ],
    });
    setCurrentQuestion(null);
  };

  const openEdit = (q) => {
    setCurrentQuestion(q);
    setFormData({
      ...q,
      QuestionType: q.QuestionType || "Regular",
    });
    setShowModal(true);
  };

  if (loading) return <div className="arcade-loader">SCANNING DATABASE...</div>;

  return (
    <div className="manage-questions-page min-vh-100 p-4">
      <div className="container bg-dark bg-opacity-75 p-4 rounded border-arcade shadow-lg">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-warning pb-2">
          <div className="d-flex align-items-center gap-3">
            {/* زر العودة الجديد */}
            <button
              className="btn btn-outline-warning arcade-font-small"
              onClick={() => navigate("/dashboard")}
              style={{ border: "2px solid" }}>
              ⬅ BACK
            </button>
            <h2 className="arcade-font text-warning mb-0">MISSION CONTROL</h2>
          </div>

          <button
            className="arcade-button-green"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}>
            [+] NEW MISSION
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover arcade-table">
            <thead>
              <tr className="text-info">
                <th>ID</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>DIFFICULTY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.QuestionID}>
                  <td className="arcade-font text-muted">#{q.QuestionID}</td>
                  <td>{q.QuestionName}</td>
                  <td>
                    <span className="badge border border-info text-info">
                      {q.Category}
                    </span>
                  </td>
                  <td>
                    {q.Rate === 100 ? "⭐" : q.Rate === 200 ? "⭐⭐" : "⭐⭐⭐"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => openEdit(q)}>
                      EDIT
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(q.QuestionID)}>
                      DEL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="arcade-modal-overlay">
          <div className="arcade-modal-content border-arcade shadow-lg">
            <h3 className="arcade-font text-warning mb-4">
              {currentQuestion ? "UPDATE DATA" : "UPLOAD DATA"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="text-info arcade-font-small">
                    CATEGORY
                  </label>
                  <select
                    className="form-select arcade-input"
                    value={formData.Category}
                    onChange={(e) =>
                      setFormData({ ...formData, Category: e.target.value })
                    }>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat.CategoryName}>
                        {cat.CategoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-info arcade-font-small">TYPE</label>
                  <select
                    className="form-select arcade-input"
                    value={formData.QuestionType}
                    onChange={(e) =>
                      setFormData({ ...formData, QuestionType: e.target.value })
                    }>
                    <option value="Regular">Regular</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-info arcade-font-small">
                    DIFFICULTY
                  </label>
                  <select
                    className="form-select arcade-input"
                    value={formData.Rate}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const pts = val === 100 ? 10 : val === 200 ? 20 : 30;
                      setFormData({ ...formData, Rate: val, Points: pts });
                    }}>
                    <option value={100}>Easy (10 XP)</option>
                    <option value={200}>Medium (20 XP) </option>
                    <option value={300}>Hard (30 XP)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-info arcade-font-small">
                  MISSION NAME
                </label>
                <input
                  type="text"
                  className="form-control arcade-input"
                  value={formData.QuestionName}
                  onChange={(e) =>
                    setFormData({ ...formData, QuestionName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-info arcade-font-small">
                  MISSION TEXT
                </label>
                <textarea
                  className="form-control arcade-input"
                  rows="3"
                  value={formData.QuestionText}
                  onChange={(e) =>
                    setFormData({ ...formData, QuestionText: e.target.value })
                  }
                  required
                />
              </div>

              <div className="answers-section">
                <p className="text-warning arcade-font-small">
                  ANSWERS CONFIGURATION:
                </p>
                {formData.answers.map((ans, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <input
                      type="text"
                      className="form-control arcade-input"
                      value={ans.AnswerText}
                      onChange={(e) => {
                        const newAns = [...formData.answers];
                        newAns[idx].AnswerText = e.target.value;
                        setFormData({ ...formData, answers: newAns });
                      }}
                      required
                    />
                    <button
                      type="button"
                      className={`btn ${ans.IsCorrect ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => {
                        const newAns = formData.answers.map((a, i) => ({
                          ...a,
                          IsCorrect: i === idx,
                        }));
                        setFormData({ ...formData, answers: newAns });
                      }}>
                      {ans.IsCorrect ? "OK" : "NO"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <button
                  type="button"
                  className="arcade-button-red"
                  onClick={() => setShowModal(false)}>
                  CANCEL
                </button>
                <button type="submit" className="arcade-button-green">
                  SAVE MISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
