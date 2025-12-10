// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-page d-flex vh-100">
      {/* Login Section */}
      <div className="half left d-flex flex-column justify-content-center align-items-center text-center p-5">
        <h2 className="mb-4 text-light">🔑 Login</h2>
        <p className="text-light">
          If you already have an account, enter here!
        </p>
        <Link
          to="/login"
          className="btn btn-primary btn-lg shadow-lg arcade-btn mt-3">
          🚀 Sign In
        </Link>
      </div>

      {/* Register Section */}
      <div className="half right d-flex flex-column justify-content-center align-items-center text-center p-5">
        <h2 className="mb-4 text-light">🏆 Register New Student</h2>
        <p className="text-light">
          Start your learning journey and earn points & achievements!
        </p>
        <Link
          to="/register"
          className="btn btn-success btn-lg shadow-lg arcade-btn mt-3">
          🌟 Register Now
        </Link>
      </div>
    </div>
  );
}
