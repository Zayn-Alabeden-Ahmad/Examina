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
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRate, setFilterRate] = useState("all");
  const [answerCount, setAnswerCount] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");

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

  const resizeAnswers = (count) => {
    const target = Math.max(2, Math.min(6, count)); // min 2, max 6
    setAnswerCount(target);

    setFormData((prev) => {
      const current = [...prev.answers];

      if (current.length < target) {
        while (current.length < target) {
          current.push({ AnswerText: "", IsCorrect: false });
        }
      } else if (current.length > target) {
        current.splice(target);
      }

      // ensure at least one correct answer remains
      if (!current.some((a) => a.IsCorrect)) {
        current[0].IsCorrect = true;
      }

      return { ...prev, answers: current };
    });
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterRate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        api.get("/myquestions/", {
          params: {
            category: filterCategory,
            rate: filterRate,
          },
        }),
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
    setAnswerCount(2);
  };

  const openEdit = (q) => {
    setCurrentQuestion(q);
    setFormData({
      ...q,
      QuestionType: q.QuestionType || "Regular",
    });
    setShowModal(true);
    setAnswerCount(q.answers && q.answers.length >= 2 ? q.answers.length : 2);
  };

  if (loading) return <div className="arcade-loader">SCANNING DATABASE...</div>;

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      String(q.QuestionName || "")
        .toLowerCase()
        .includes(term) ||
      String(q.QuestionText || "")
        .toLowerCase()
        .includes(term) ||
      String(q.QuestionID || "")
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <div className="manage-questions-page min-vh-100 p-4">
      <div className="container bg-dark bg-opacity-75 p-4 rounded border-arcade shadow-lg">
        <div
          className="d-flex flex-wrap align-items-end gap-3 mb-4 p-3 rounded"
          style={{
            background: "rgba(2, 6, 23, 0.7)",
            border: "1px solid rgba(250, 204, 21, 0.35)",
          }}>
          <div>
            <label className="text-info arcade-font-small d-block mb-1">
              CATEGORY
            </label>
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ minWidth: "220px" }}>
              <option value="all">ALL CATEGORIES</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat.CategoryName}>
                  {cat.CategoryName.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-info arcade-font-small d-block mb-1">
              DIFFICULTY
            </label>
            <select
              className="form-select "
              value={filterRate}
              onChange={(e) => setFilterRate(e.target.value)}
              style={{ minWidth: "220px" }}>
              <option value="all">ALL LEVELS</option>
              <option value="100">EASY ⭐</option>
              <option value="200">MEDIUM ⭐⭐</option>
              <option value="300">HARD ⭐⭐⭐</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="text-info arcade-font-small d-block mb-1">
            SEARCH QUESTION
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID, name, or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "500px" }}
          />
          <div className="search-help-wrap mt-2" style={{ maxWidth: "700px" }}>
            <span className="search-help-trigger arcade-font-small">
              ⓘ SEARCH HELP
            </span>
            <div className="search-help-tooltip">
              You can search by <strong>ID</strong>,{" "}
              <strong>Mission Name</strong>, or any word inside{" "}
              <strong>Mission Text</strong>.
              <br />
              Examples: <span className="text-warning">12</span>,{" "}
              <span className="text-warning">fractions</span>,{" "}
              <span className="text-warning">python loop</span>.
            </div>
          </div>
        </div>

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
              {filteredQuestions.map((q) => (
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
              {filteredQuestions.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-secondary py-4 arcade-font-small">
                    NO MATCHING QUESTIONS FOUND
                  </td>
                </tr>
              )}
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
                <div className="col-md-4 mb-3">
                  <label className="text-info arcade-font-small">
                    NUMBER OF ANSWERS
                  </label>
                  <select
                    className="form-select arcade-input"
                    value={answerCount}
                    onChange={(e) => resizeAnswers(parseInt(e.target.value))}>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} ANSWERS
                      </option>
                    ))}
                  </select>
                </div>

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
