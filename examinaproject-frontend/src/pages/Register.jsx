// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // أضفنا Link هنا
import axios from "axios";
import "./Auth.css";
import "./arcade.css";
import api from "../api/apiService";

export default function Register() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/register/student/", {
        first_name,
        last_name,
        email,
        password,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("❌ Registration failed.");
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="arcade-card p-4">
        <h2 className="text-center arcade-title mb-4">🎮 CREATE PLAYER</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-3">
            <label className="form-label text-light">First Name</label>
            <input
              type="text"
              className="form-control arcade-input"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-3">
            <label className="form-label text-light">Last Name</label>
            <input
              type="text"
              className="form-control arcade-input"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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
            🌟 CREATE ACCOUNT
          </button>
        </form>

        {/* رابط العودة لتسجيل الدخول لجعل التصميم متناظراً */}
        <p className="text-center text-light mt-3">
          Already a player? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
