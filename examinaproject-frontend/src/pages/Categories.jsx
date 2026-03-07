import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./arcade.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const iconMap = {
    Math: "🔢",
    Science: "🧪",
    Programming: "💻",
    English: "🔤",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/exams/category/");
        // تأكد أن res.data تصل كـ [{CategoryName: "Math"}, ...]
        setCategories(res.data);
      } catch (err) {
        console.error("Database Connection Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-warning arcade-font">
        SCANNING SECTORS...
      </div>
    );
  }

  return (
    <div
      className="categories-page min-vh-100 p-5"
      style={{ background: "#020617" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1
            className="arcade-font text-warning"
            style={{ fontSize: "35px", textShadow: "0 0 10px #facc15" }}>
            SELECT STAGE
          </h1>
          <p className="text-info arcade-font">Choose your battleground</p>
        </div>

        <div className="row g-4 ">
          {categories.length > 0 ? (
            categories.map((cat, index) => (
              <div key={index} className="col-md-4">
                <div
                  className="arcade-card p-4 text-center h-100 category-hover-effect"
                  onClick={() =>
                    navigate(`/quiz/${encodeURIComponent(cat.CategoryName)}`)
                  }
                  style={{
                    cursor: "pointer",
                    border: "2px solid #3b82f6",
                    background: "rgba(30, 58, 138, 0.2)",
                  }}>
                  <div style={{ fontSize: "50px" }} className="mb-3">
                    {iconMap[cat.CategoryName] || "🎮"}
                  </div>
                  <h3
                    className="arcade-font text-white"
                    style={{ fontSize: "18px" }}>
                    {cat.CategoryName.toUpperCase()}
                  </h3>
                  <div className="mt-3">
                    <span
                      className="badge bg-primary arcade-font"
                      style={{ fontSize: "10px" }}>
                      MISSION ACTIVE
                    </span>
                  </div>
                  <div className="btn btn-outline-info mt-4 w-100 arcade-font">
                    ENTER SECTOR
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center arcade-font">
              NO SECTORS FOUND IN DATABASE
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <button
            className="btn btn-link text-secondary arcade-font"
            onClick={() => navigate("/dashboard")}>
            ← BACK TO COMMAND CENTER
          </button>
        </div>
      </div>
    </div>
  );
}
