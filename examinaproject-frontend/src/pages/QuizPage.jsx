import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/apiService";
import "./QuizPage.css";
import "./arcade.css";

export default function QuizPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // States لإدارة الواجهة والاختيارات
  const [gameState, setGameState] = useState("selection"); // selection, loading, quiz, result
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState([]);

  // States الكويز
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // دالة جلب الأسئلة (تبدأ عند اختيار الصعوبة)
  const startMission = async () => {
    setGameState("loading");
    try {
      const res = await api.get(
        `/exams/questions/${categoryName}/?difficulty=${difficulty}`,
      );
      if (res.data.length === 0) {
        alert("No questions found for this difficulty!");
        setGameState("selection");
        return;
      }
      setQuestions(res.data);
      setGameState("quiz");
    } catch (err) {
      console.error("Failed to load mission", err);
      alert("Error linking to base!");
      setGameState("selection");
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerId });
  };

  const handleRating = (questionId, value) => {
    setRatings({ ...ratings, [questionId]: value });
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    const payload = questions.map((q) => {
      const selectedAnswerId = selectedAnswers[q.QuestionID];
      const selectedAnswerObj = q.answers.find(
        (a) => a.AnswerID === selectedAnswerId,
      );
      const isCorrect = selectedAnswerObj ? selectedAnswerObj.IsCorrect : false;
      return {
        questionId: q.QuestionID,
        answerId: selectedAnswerId,
        isCorrect: isCorrect,
        pointsEarned: isCorrect ? q.Points : 0,
        qRatedByStudent: ratings[q.QuestionID] || 0,
      };
    });

    try {
      const res = await api.post("/exams/submitAnswers/", payload);
      setQuizResult(res.data);
      setGameState("result");
    } catch (err) {
      alert("Critical Error: Submission failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- شاشات العرض المتغيرة ---

  // 1. شاشة اختيار الصعوبة (تظهر أولاً)
  if (gameState === "selection") {
    return (
      <div className="selection-screen vh-100 d-flex align-items-center justify-content-center text-white">
        <div className="arcade-card p-5 text-center shadow-lg">
          <h1 className="arcade-title mb-4 animate-pulse">SELECT DIFFICULTY</h1>
          <h3 className="text-info mb-4">Subject: {categoryName}</h3>

          <div className="d-flex justify-content-center gap-3 mb-5">
            {["Easy", "Medium", "Hard"].map((lv) => (
              <button
                key={lv}
                className={`btn arcade-btn-outline px-4 ${difficulty === lv ? "active" : ""}`}
                onClick={() => setDifficulty(lv)}>
                {lv}
              </button>
            ))}
          </div>

          <button
            className="btn arcade-button w-100 py-3 fs-4"
            onClick={startMission}>
            READY? START!
          </button>
        </div>
      </div>
    );
  }

  // 2. شاشة التحميل
  if (gameState === "loading") {
    return <div className="arcade-loading">INITIALIZING MISSION...</div>;
  }

  // 3. شاشة النتيجة
  if (gameState === "result") {
    return <ResultView result={quizResult} navigate={navigate} />;
  }

  // 4. شاشة الكويز الرئيسية
  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="quiz-page vh-100 text-white">
      <div className="container py-5">
        <div className="progress-container mb-4">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}></div>
        </div>

        <div className="arcade-card p-4 shadow-lg">
          <div className="d-flex justify-content-between mb-3">
            <span className="text-warning fw-bold">
              QUESTION {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="badge bg-primary px-3">{difficulty} MODE</span>
          </div>

          <h2 className="question-text mb-4 text-center">
            {currentQuestion.QuestionText}
          </h2>

          <div className="answers-grid row g-3">
            {currentQuestion.answers.map((answer) => (
              <div key={answer.AnswerID} className="col-md-6">
                <button
                  className={`answer-btn w-100 p-3 ${selectedAnswers[currentQuestion.QuestionID] === answer.AnswerID ? "selected" : ""}`}
                  onClick={() =>
                    handleAnswerSelect(
                      currentQuestion.QuestionID,
                      answer.AnswerID,
                    )
                  }>
                  {answer.AnswerText}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 d-flex flex-column align-items-center border-top pt-4">
            <p className="text-info mb-2 arcade-font-small">
              RATE THIS MISSION QUALITY:
            </p>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star-icon ${(ratings[currentQuestion.QuestionID] || 0) >= star ? "active" : ""}`}
                  onClick={() =>
                    handleRating(currentQuestion.QuestionID, star)
                  }>
                  {(ratings[currentQuestion.QuestionID] || 0) >= star
                    ? "★"
                    : "☆"}
                </span>
              ))}
            </div>
            {/* عرض نصي بسيط للتأكيد */}
            {ratings[currentQuestion.QuestionID] && (
              <span className="text-warning mt-2 animate-pulse small">
                RATING SAVED: {ratings[currentQuestion.QuestionID]}/5
              </span>
            )}
          </div>
          <div className="mt-4 d-flex justify-content-between pt-4 border-top">
            <button
              className="btn btn-secondary arcade-font-small"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>
              BACK
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                className="btn btn-danger arcade-button-red px-5"
                onClick={submitQuiz}
                disabled={
                  isSubmitting || !selectedAnswers[currentQuestion.QuestionID]
                }>
                {isSubmitting ? "UPLOADING..." : "FINISH MISSION"}
              </button>
            ) : (
              <button
                className="btn btn-warning arcade-button px-5"
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex + 1)
                }
                disabled={!selectedAnswers[currentQuestion.QuestionID]}>
                NEXT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultView({ result, navigate }) {
  // كود الـ ResultView يبقى كما هو في كودك السابق
  return (
    <div className="result-container text-center animate-pop-in vh-100 d-flex align-items-center justify-content-center">
      <div className="arcade-card p-5">
        <h1 className="arcade-title text-warning mb-4">MISSION COMPLETE!</h1>
        <div className="fs-3 mb-2">
          Points:{" "}
          <span className="text-success">+{result.total_points_earned}</span>
        </div>
        <button
          className="btn arcade-button mt-4 w-100"
          onClick={() => navigate("/dashboard")}>
          RETURN TO BASE
        </button>
      </div>
    </div>
  );
}
