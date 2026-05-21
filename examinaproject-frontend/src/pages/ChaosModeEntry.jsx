import { useEffect, useState } from "react";
import { getChaosEntry, selectChaosCard } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./ChaosMode.css";

export default function ChaosModeEntry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getChaosEntry();
        setData(res.data);
      } catch {
        Swal.fire("Error", "Failed to load Chaos data.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const pickCard = async (cardId, label) => {
    if (selecting) return;

    const confirm = await Swal.fire({
      title: "Confirm Card Selection",
      text: `You selected: ${label}. Card effect will be locked for this run.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#e5e7eb",
      confirmButtonColor: "#facc15",
    });

    if (!confirm.isConfirmed) return;

    setSelecting(true);
    try {
      await selectChaosCard(cardId);

      await Swal.fire({
        title: "Card Selected!",
        text: "Effect unlocked. Loading Chaos Quiz...",
        icon: "success",
        timer: 1100,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e5e7eb",
      });

      navigate("/chaos-mode/quiz");
    } catch {
      Swal.fire("Error", "Card selection failed.", "error");
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-light">Loading Chaos...</div>;
  }

  if (!data) {
    return <div className="text-center py-5 text-danger">No data</div>;
  }

  return (
    <div className="chaos-entry-page text-light">
      <div className="container py-5">
        <div className="chaos-shell p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="chaos-heading mb-0">CHAOS MODE</h2>
            <button
              className="btn chaos-back-btn"
              onClick={() => navigate("/dashboard")}>
              BACK
            </button>
          </div>

          <div className="chaos-score mb-4">
            <strong>CHAOS SCORE:</strong> {data.session?.ChaosScore ?? 0}
          </div>

          {/* DAILY CARD */}
          <div
            className="chaos-panel mb-4 daily-clickable"
            role="button"
            tabIndex={0}
            onClick={() =>
              pickCard(data.session?.DailyCard?.CardID, "Daily Card")
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pickCard(data.session?.DailyCard?.CardID, "Daily Card");
              }
            }}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <p className="chaos-kicker mb-1">OPTION 1</p>
                <h4 className="chaos-title mb-2">DAILY CARD</h4>
                <p className="chaos-muted mb-0">
                  Fixed for today. Safe choice, hidden effect until selected.
                </p>
              </div>
              <span className="chaos-chip">DAILY PICK</span>
            </div>
          </div>

          {/* MYSTERY CARDS */}
          <p className="chaos-kicker mb-1">OPTION 2</p>
          <h4 className="chaos-title mb-3">PICK 1 OF 3 MYSTERY CARDS</h4>
          <div className="row g-4">
            {data.random_cards?.map((c, i) => (
              <div key={c.CardID} className="col-md-4">
                <div
                  className="chaos-card h-100 p-4 d-flex flex-column justify-content-between mystery-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => pickCard(c.CardID, `Mystery Card #${i + 1}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pickCard(c.CardID, `Mystery Card #${i + 1}`);
                    }
                  }}>
                  <div className="mystery-front">
                    <div className="chaos-card-icon mb-3">🃏</div>
                    <h5 className="mb-2">MYSTERY CARD #{i + 1}</h5>
                    <p className="chaos-muted mb-0">
                      High-risk random effect. Perfect for chaos runs.
                    </p>
                  </div>

                  <div className="mystery-hover-only">
                    <div className="joker-only">🃏</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="chaos-footnote mt-4 mb-0">
            Card details are revealed only after selection.
          </p>
        </div>
      </div>
    </div>
  );
}
