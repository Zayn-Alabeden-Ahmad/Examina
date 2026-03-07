// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="text-center">
        <h1 className="arcade-title mb-5" style={{ fontSize: "60px" }}>
          🎮 EXAMINA
        </h1>

        <div className="d-flex gap-4 justify-content-center">
          <Link to="/login" className="btn arcade-button text-white px-5">
            🔑 LOGIN
          </Link>

          <Link to="/register" className="btn arcade-button text-white px-5">
            🏆 REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
}
