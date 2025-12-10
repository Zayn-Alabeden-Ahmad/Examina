// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // student أو teacher

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("http://localhost:8000/api/home/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

        // تحديد نوع المستخدم حسب الحقول
        if (res.data.hasOwnProperty("points")) {
          setUserType("student");
        } else if (res.data.hasOwnProperty("stared")) {
          setUserType("teacher");
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  if (!user)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light">
        Loading...
      </div>
    );

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await axios.post(
        "http://localhost:8000/api/logout/",
        { refresh },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      // مسح التوكنات من localStorage
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      // إعادة التوجيه للصفحة الرئيسية أو صفحة تسجيل الدخول
      window.location.href = "/";
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  const PrintStars = (starsCount) => {
    let stars = "";
    while (starsCount) {
      stars += "⭐";
      starsCount--;
    }
    return stars;
  };

  return (
    <div className="dashboard-page vh-100">
      {/* Navbar */}
      <div className="arcade-navbar d-flex justify-content-between align-items-center p-3">
        <div className="arcade-logo">Examina</div>
        <div className="d-flex align-items-center">
          {user.profile_picture && (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="profile-img me-3"
            />
          )}
          <div className="arcade-info">
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            {userType === "student" && (
              <div>
                <strong>Points:</strong> {user.points}
              </div>
            )}
            {userType === "student" && (
              <div>
                <strong>Level:</strong>{" "}
                {user.level + " " + user.subLevel || "N/A"}
              </div>
            )}
            {userType === "teacher" && (
              <div>
                <strong> Star Level :</strong>{" "}
                {user.stared ? PrintStars(user.NumStars) : "🧑🏻‍🏫"}
              </div>
            )}
            <div>
              <strong>Status:</strong> {user.status ? "🟢" : "🔴"}
            </div>
            <button
              className="btn btn-danger arcade-btn"
              onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-content d-flex justify-content-center align-items-center">
        <h1 className="arcade-title">
          {userType === "student" ? "Students New Home" : "Teachers Dashboard"}
        </h1>
      </div>
    </div>
  );
}
