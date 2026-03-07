import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./arcade.css";

export default function QuizPage() {
  const { category_name } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [studentRate, setStudentRate] = useState(3);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  const startQuiz = async (level) => {
    setDifficulty(level);
    setLoading(true);
    try {
      const res = await api.get(`/exams/questions/${category_name}/`, {
        params: { difficulty: level },
      });
      setQuestions(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const currentQ = questions[currentIndex];
    const selectedAnswerId = selectedAnswers[currentQ?.QuestionID];
    if (!selectedAnswerId) {
      alert("Select an answer!");
      return;
    }

    setSubmitting(true);
    try {
      const selectedAnsObj = currentQ.answers.find(
        (a) => a.AnswerID === selectedAnswerId,
      );
      const dataToSubmit = {
        questionId: currentQ.QuestionID,
        answerId: selectedAnswerId,
        pointsEarned: selectedAnsObj?.IsCorrect ? currentQ.Points : 0,
        isCorrect: selectedAnsObj?.IsCorrect || false,
        qRatedByStudent: studentRate,
      };
      await api.post("/exams/submitAnswers/", dataToSubmit);
      navigate("/dashboard");
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. شاشة اختيار الصعوبة
  if (!difficulty) {
    return (
      <div
        className="vh-100 d-flex flex-column justify-content-center align-items-center text-white arcade-font"
        style={{ backgroundColor: "#1a1a1a" }}>
        {/* زر العودة لصفحة الكاتيغوري */}
        <button
          className="btn btn-outline-secondary position-absolute top-0 start-0 m-4 text-white"
          style={{
            backgroundColor: "#333",
            border: "1px solid #666",
            opacity: 1,
          }}
          onClick={() => navigate("/categories")}>
          ← BACK TO CATEGORIES
        </button>

        <h2 className="mb-5 text-warning">SELECT DIFFICULTY</h2>
        <div className="d-flex gap-3">
          {["Easy", "Medium", "Hard"].map((lvl) => (
            <button
              key={lvl}
              className="btn p-4 shadow-lg text-white"
              style={{
                backgroundColor: "#2c3e50",
                border: "2px solid #3498db",
                opacity: 1,
                minWidth: "140px",
                fontWeight: "bold",
              }}
              onClick={() => startQuiz(lvl)}>
              {lvl}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div
        className="vh-100 d-flex justify-content-center align-items-center text-warning arcade-font"
        style={{ backgroundColor: "#1a1a1a" }}>
        LOADING SECTOR...
      </div>
    );

  if (questions.length === 0)
    return (
      <div
        className="text-white text-center p-5 arcade-font vh-100 d-flex flex-column justify-content-center align-items-center"
        style={{ backgroundColor: "#1a1a1a" }}>
        NO QUESTIONS FOUND FOR {difficulty}.
        <button
          className="btn btn-link text-warning"
          onClick={() => setDifficulty(null)}>
          GO BACK
        </button>
      </div>
    );

  const currentQ = questions[currentIndex];
  const total = questions.length;

  return (
    <div
      className="quiz-page min-vh-100 p-3 p-md-5"
      style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* زر العودة للوراء أثناء الكويز */}
        <button
          className="btn btn-sm btn-outline-light mb-3 arcade-font"
          style={{ backgroundColor: "#333", opacity: 1 }}
          onClick={() => navigate("/categories")}>
          ← EXIT TO CATEGORIES
        </button>

        <div
          className="arcade-card p-4 p-md-5"
          style={{
            backgroundColor: "#2d2d2d",
            border: "1px solid #444",
            borderRadius: "15px",
          }}>
          <h3 className="text-white text-center mb-4">
            {currentQ.QuestionText}
          </h3>
          <div className="row g-3">
            {currentQ.answers?.map((ans) => {
              const isSelected =
                selectedAnswers[currentQ.QuestionID] === ans.AnswerID;
              return (
                <div key={ans.AnswerID} className="col-12">
                  <button
                    className={`btn w-100 p-3 text-white ${isSelected ? "active" : ""}`}
                    style={{
                      backgroundColor: isSelected ? "#f39c12" : "#3e3e3e",
                      border: isSelected ? "2px solid #fff" : "1px solid #555",
                      color: isSelected ? "#000" : "#fff",
                      opacity: 1,
                      textAlign: "left",
                    }}
                    onClick={() =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQ.QuestionID]: ans.AnswerID,
                      })
                    }>
                    <span className="arcade-font">{ans.AnswerText}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-between mt-5">
            <button
              className="btn btn-secondary text-white"
              style={{ opacity: 1, backgroundColor: "#555" }}
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}>
              BACK
            </button>
            {currentIndex === total - 1 ? (
              <button
                className="btn btn-warning px-5 text-dark"
                style={{ opacity: 1, fontWeight: "bold" }}
                onClick={handleFinish}
                disabled={submitting}>
                FINISH
              </button>
            ) : (
              <button
                className="btn btn-primary px-5 text-white"
                style={{ opacity: 1, backgroundColor: "#007bff" }}
                onClick={() => setCurrentIndex((prev) => prev + 1)}>
                NEXT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
