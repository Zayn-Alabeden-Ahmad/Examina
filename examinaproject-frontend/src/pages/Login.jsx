// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/login/", {
        email,
        password,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/Dashboard");
    } catch (err) {
      setError("❌ Login failed.");
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg auth-card">
        <h2 className="text-center mb-4 text-primary">🔐 Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">📧 Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">🔑 Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100 arcade-btn">
            Sign In 🚀
          </button>
        </form>
        <p className="text-center mt-3">
          No account? <Link to="/register">🏆 Register Now</Link>
        </p>
      </div>
    </div>
  );
}
