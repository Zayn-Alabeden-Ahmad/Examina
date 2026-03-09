// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import "./arcade.css";
import api from "../api/apiService";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login/", {
        email,
        password,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("❌ Login failed.");
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="arcade-card p-4">
        <h2 className="text-center arcade-title mb-4">🔐 LOGIN</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light">Email</label>
            <input
              type="email"
              className="form-control arcade-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-light">Password</label>
            <input
              type="password"
              className="form-control arcade-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn arcade-button w-100 text-white">
            🚀 START LEARNING
          </button>
        </form>

        <p className="text-center text-light mt-3">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
