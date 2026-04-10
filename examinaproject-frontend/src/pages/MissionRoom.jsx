import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateChallengeQuestions, submitChallenge } from "../api/apiService";
import Swal from "sweetalert2";

export default function MissionRoom() {
  const { challengeId } = useParams();
  const studentId = localStorage.getItem("studentId");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadMission = async () => {
      try {
        const res = await generateChallengeQuestions(challengeId, studentId);
        setQuestions(res.data.questions);
      } catch (err) {
        Swal.fire("Error", "Could not initialize mission", "error");
        navigate("/challenges-list"); // تم تعديل المسار هنا
      }
    };
    loadMission();
  }, [challengeId, studentId, navigate]);

  const handleSelectAnswer = (qId, aId) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: aId }));
  };

  const handleSubmit = async () => {
    const answersList = Object.values(userAnswers);

    if (answersList.length < questions.length) {
      Swal.fire("Wait!", "Please answer all questions.", "warning");
      return;
    }

    try {
      const payload = {
        student_id: studentId,
        challenge_id: challengeId,
        answers: answersList,
      };

      const res = await submitChallenge(payload);

      if (res.data.status === "success") {
        Swal.fire(
          "MISSION ACCOMPLISHED!",
          `Score: ${res.data.score_achieved} XP!`,
          "success",
        );
      } else {
        Swal.fire(
          "MISSION FAILED",
          `Penalty: -${res.data.penalty_deducted} XP.`,
          "error",
        );
      }
      navigate("/challenges-list"); // تم توحيد المسار هنا
    } catch (err) {
      Swal.fire("SYSTEM FAILURE", "Could not upload results", "error");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // تنظيف الـ Event عند الخروج الطبيعي (بعد انتهاء المهمة)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div
      className="mission-container p-5 arcade-font text-white"
      style={{ background: "#020617", minHeight: "100vh" }}>
      <h2 className="text-warning mb-5">MISSION IN PROGRESS...</h2>
      {questions.map((q, index) => (
        <div
          key={q.id} // لاحظ هون q.id لأن الـ Serializer بيحول QuestionID لـ id غالباً
          className="mb-5 p-4 border border-info rounded"
          style={{ background: "rgba(30, 41, 59, 0.5)", position: "relative" }}>
          {/* عرض الـ QuestionName اللي سألت عنه */}
          <div className="d-flex justify-content-between mb-3 border-bottom border-secondary pb-2">
            <span className="text-info fw-bold" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-cpu-fill me-2"></i>
              TASK: {q.QuestionName}
            </span>
            <span className="badge bg-dark text-warning border border-warning">
              XP: {q.points}
            </span>
          </div>

          <p className="fs-5 mb-4 text-light">
            {index + 1}. {q.text}
          </p>

          <div className="d-flex flex-wrap gap-3">
            {q.answers.map((ans) => (
              <button
                key={ans.AnswerID}
                className={`btn ${userAnswers[q.id] === ans.AnswerID ? "btn-info" : "btn-outline-info"}`}
                style={{ transition: "0.3s" }}
                onClick={() => handleSelectAnswer(q.id, ans.AnswerID)}>
                {ans.AnswerText}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        className="btn btn-warning w-100 p-3 fw-bold mt-4"
        onClick={handleSubmit}>
        TRANSMIT DATA
      </button>
    </div>
  );
}
