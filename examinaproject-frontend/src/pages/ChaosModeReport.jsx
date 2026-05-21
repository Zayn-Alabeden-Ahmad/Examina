import { useLocation, useNavigate } from "react-router-dom";

export default function ChaosModeReport() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state?.reportData;
  const card = state?.card;

  if (!data)
    return <div className="text-center py-5 text-light">No report data</div>;

  return (
    <div className="container py-4 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-warning">Chaos Report</h3>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-warning"
            onClick={() => window.print()}>
            Print
          </button>
          <button
            className="btn btn-warning"
            onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>

      <div className="alert alert-dark border border-warning">
        <div>
          <strong>Card:</strong> {card?.Name}
        </div>
        <div>
          <strong>Chaos Score Gained:</strong> {data.chaos_score_gained}
        </div>
        <div>
          <strong>Current Chaos Score:</strong> {data.current_chaos_score}
        </div>
        <div>
          <strong>Correct:</strong> {data.correct_count} |{" "}
          <strong>Wrong:</strong> {data.wrong_count}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
              <th>Result</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {(data.report || []).map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.question_text}</td>
                <td>{r.student_answer}</td>
                <td>{r.correct_answer}</td>
                <td>{r.is_correct ? "✅" : "❌"}</td>
                <td>{r.final_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
