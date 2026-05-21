import { useEffect, useState } from "react";
import { getChaosQuestions, submitChaosAnswers } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ChaosModeQuiz() {
  const [card, setCard] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const getCardBenefitText = (card) => {
    if (!card) return "";
    const type = card.Type;
    const value = card.Value;

    if (type === "PERCENT_POINTS") {
      const n = Number(value);
      return n >= 0
        ? `This card boosts each correct answer by ${n}% in Chaos Mode.`
        : `This card reduces each correct answer by ${Math.abs(n)}% in Chaos Mode.`;
    }

    if (type === "FLAT_POINTS") {
      const n = Number(value);
      return n >= 0
        ? `This card adds +${n} flat points to each correct answer.`
        : `This card subtracts ${Math.abs(n)} flat points from each correct answer.`;
    }

    if (type === "FORCE_DIFFICULTY") {
      return `This card forces all questions to ${value} difficulty.`;
    }

    if (type === "FORCE_CATEGORY") {
      return `This card locks all questions to one category: ${value}.`;
    }

    return "Special Chaos effect is active.";
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getChaosQuestions();
        setCard(res.data.card);
        setQuestions(res.data.questions || []);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Could not load chaos questions.",
          background: "#0f172a",
          color: "#e5e7eb",
          confirmButtonColor: "#facc15",
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const choose = (qId, aId) => {
    setAnswers((p) => ({ ...p, [qId]: aId }));
  };

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Answers",
        text: "Please answer all questions first.",
        background: "#0f172a",
        color: "#e5e7eb",
        confirmButtonColor: "#facc15",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Submit Chaos Answers?",
      text: "Your answers will be locked after submit.",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#e5e7eb",
      confirmButtonColor: "#facc15",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.QuestionID,
          answerId: answers[q.QuestionID],
        })),
      };

      const res = await submitChaosAnswers(payload);

      await Swal.fire({
        icon: "success",
        title: "Submitted!",
        text: "Great run. Opening your report...",
        timer: 1000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e5e7eb",
      });

      navigate("/chaos-mode/report", { state: { reportData: res.data, card } });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again.",
        background: "#0f172a",
        color: "#e5e7eb",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-light">Loading questions...</div>
    );
  }

  return (
    <div className="container py-4 text-light chaos-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-warning">Chaos Quiz</h3>
        <span className="badge bg-info text-dark px-3 py-2">{card?.Name}</span>
      </div>

      <div className="alert chaos-alert-warning border-0 shadow-sm">
        <div className="fw-bold mb-1">Active Card Effect</div>
        <div>{getCardBenefitText(card)}</div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.QuestionID} className="card bg-dark border-secondary mb-3">
          <div className="card-body">
            <h6 className="text-info">
              {idx + 1}. {q.QuestionText}
            </h6>

            <div className="row g-2 mt-2">
              {q.answers.map((a) => (
                <div key={a.AnswerID} className="col-md-6">
                  <button
                    className={`btn w-100 ${
                      answers[q.QuestionID] === a.AnswerID
                        ? "btn-info"
                        : "btn-outline-info"
                    }`}
                    onClick={() => choose(q.QuestionID, a.AnswerID)}>
                    {a.AnswerText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        className="btn btn-warning w-100 fw-bold"
        disabled={sending}
        onClick={submit}>
        {sending ? "Submitting..." : "Submit Chaos Answers"}
      </button>
    </div>
  );
}
