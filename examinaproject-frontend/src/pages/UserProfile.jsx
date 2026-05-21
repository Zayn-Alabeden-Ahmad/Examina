import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  getStudentProfileDetail,
  getTeacherProfileDetail,
} from "../api/apiService";
import "./UserProfile.css";

const UserProfile = () => {
  const { type, id } = useParams();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res =
          type === "student"
            ? await getStudentProfileDetail(id)
            : await getTeacherProfileDetail(id);
        setProfile(res.data);
      } catch (err) {
        console.error("Profile not found");
      }
    };
    loadProfile();
  }, [id, type]);

  if (!profile)
    return <div className="loading-text text-warning">LOADING_DATA...</div>;

  // بناء رابط الصورة بناءً على الحقل القادم من الباك أند
  // الباك أند يرسل حقل باسم 'profile_picture'
  const imageUrl = profile.profile_picture
    ? `http://localhost:8000${profile.profile_picture}`
    : "https://via.placeholder.com/150";

  return (
    <div className="arcade-wrapper min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="position-absolute top-0 start-0 p-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline-info border-2 fw-bold text-uppercase arcade-back-btn">
            <span className="me-2">{"<"}</span> Return_to_Nexus
          </button>
        </div>
        <div className="arcade-main-card mx-auto shadow-glow">
          {/* Header Section */}
          <div className="d-flex align-items-center gap-4 mb-4">
            <div className="profile-pic-frame">
              <img
                src={imageUrl}
                alt="User Avatar"
                className="img-fluid rounded-1"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </div>
            <div className="user-info-text">
              <h2 className="user-name-text mb-0 text-uppercase">
                {profile.first_name} {profile.last_name}
              </h2>
              {/* بما أن الـ View لا ترسل email حالياً، نتركها احتياطاً أو نحذفها */}
              <p className="user-email-text mb-2 text-secondary small">
                {profile.email || "STATUS_ONLINE"}
              </p>
              <span className="user-status-label px-2 py-1">
                {type === "student" ? "ELITE STUDENT" : "ELITE TEACHER"}
              </span>
            </div>
          </div>

          <hr className="divider-line border-secondary opacity-25" />

          {/* Stats Row - تم تعديل المفاتيح لتطابق الـ View */}
          <div className="row text-center my-4 py-2">
            <div className="col-6 border-end border-secondary border-opacity-25">
              <p className="stat-label mb-1 text-muted">Rank / Level</p>
              <h3 className="stat-value text-white fw-bold">
                {type === "student" ? profile.level : profile.star_level}
              </h3>
            </div>
            <div className="col-6">
              <p className="stat-label mb-1 text-muted">
                {type === "student" ? "Experience Points" : "Status"}
              </p>
              <h3 className="stat-value text-info fw-bold">
                {type === "student" ? `${profile.student_points} XP` : "ACTIVE"}
              </h3>
            </div>
          </div>

          {/* Biography Area - الحقل في الباك أند هو 'bio' */}
          <div className="bio-container p-3 mb-4 bg-black bg-opacity-50 border border-secondary border-opacity-25 rounded">
            <p className="bio-title text-warning small fw-bold mb-1 uppercase">
              User Biography
            </p>
            <p className="bio-content text-light small italic mb-0">
              "{profile.bio || "No biography provided by user."}"
            </p>
          </div>

          {/* Achievements Section */}

          <div className="achievements-mini-section mt-4">
            <p className="text-secondary extra-small mb-3 uppercase tracking-widest border-bottom border-dark pb-1">
              <span className="text-warning">#</span> Achievements_Unlocked
            </p>
            <div className="d-flex gap-3 flex-wrap justify-content-start">
              {profile.achievements && profile.achievements.length > 0 ? (
                profile.achievements.map((ach, index) => (
                  // إضافة Tooltip يعرض اسم الإنجاز عند الحوم عليه
                  <div
                    key={index}
                    className="achievement-wrapper"
                    title={`${ach.name}: ${ach.description}`}>
                    <div className="ach-icon-container">
                      <img
                        // دمج رابط السيرفر مع مسار الصورة القادم من الباك أند
                        src={
                          ach.image.startsWith("http")
                            ? ach.image
                            : `http://localhost:8000${ach.image}`
                        }
                        alt={ach.name}
                        className="ach-icon-img"
                        // حل احتياطي في حال فشل تحميل الصورة من السيرفر
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/5968/5968923.png";
                        }}
                      />
                    </div>
                    <span className="ach-tooltip-text">{ach.name}</span>
                  </div>
                ))
              ) : (
                // رسالة تظهر إذا لم يحقق المستخدم أي إنجاز (مثل حالة Mark Johim)
                <div className="text-muted small italic opacity-50 tracking-tighter">
                  [ NO_ACHIEVEMENTS_RECORDED_IN_DATABASE ]
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/leaderboard")}
              className="system-btn w-100 text-uppercase py-2 rounded">
              RETURN_TO_LEADERBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
