import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/apiService";
import "./MyProfile.css";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    profile: { Bio: "" },
    status: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
      setFormData({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        age: res.data.extra_info?.Age || "",
        profile: { Bio: res.data.profile?.Bio || "" },
        status: getStatusValue(res.data) || "inactive",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email", formData.email);
      data.append("status", formData.status);
      data.append("profile.Bio", formData.profile.Bio);

      if (selectedFile) {
        data.append("profile.ProfilePicture", selectedFile);
      }

      if (!isStudent) {
        data.append("age", formData.age);
      }

      await updateMyProfile(data);
      setIsEditing(false);
      setSelectedFile(null);
      fetchProfileData();
    } catch (err) {
      console.error("Update Error:", err.response?.data);
      alert("FAILED TO UPDATE PROFILE IMAGE OR DATA");
    }
  };

  if (loading)
    return (
      <div className="examina-bg min-vh-100 text-center py-5 text-warning fw-bold">
        INITIALIZING SYSTEM...
      </div>
    );
  const getStatusValue = (obj) => obj?.status ?? obj?.Status ?? "";
  const isOnline = (obj) => {
    const s = String(getStatusValue(obj)).trim().toLowerCase();
    return s === "active" || s === "online" || s === "true" || s === "1";
  };

  const isStudent =
    profile.extra_info && profile.extra_info.level_name !== undefined;

  return (
    <div className="examina-bg min-vh-100 py-5 font-monospace text-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="profile-card border-gold p-4">
              <div className="d-flex align-items-center gap-4 mb-4 border-bottom border-secondary pb-4">
                <div className="position-relative">
                  <img
                    src={
                      profile.profile.ProfilePicture ||
                      "https://via.placeholder.com/150"
                    }
                    className="profile-img shadow-glow"
                    alt="avatar"
                  />
                  <div
                    className="online-indicator"
                    style={{
                      backgroundColor: isOnline(profile)
                        ? "#22c55e"
                        : "#ef4444",
                    }}></div>
                </div>
                <div>
                  <h2 className="text-yellow mb-0 text-uppercase fw-black">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-secondary small mb-2">{profile.email}</p>
                  <span
                    className={`badge ${isStudent ? "bg-info" : "bg-danger"} text-uppercase`}>
                    {isStudent ? "Elite Student" : "Master Teacher"}
                  </span>
                </div>
              </div>

              <div className="info-content">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="arcade-form">
                    <div className="row g-3">
                      {/* إضافة حقل تعديل الصورة */}
                      <div className="col-12 mb-2">
                        <label className="text-yellow small uppercase mb-1 d-block">
                          Change Profile Picture
                        </label>
                        <input
                          type="file"
                          className="form-control arcade-input"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="text-yellow small uppercase mb-1">
                          First Name
                        </label>
                        <input
                          className="form-control arcade-input"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="text-yellow small uppercase mb-1">
                          Last Name
                        </label>
                        <input
                          className="form-control arcade-input"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-12">
                        <label className="text-yellow small uppercase mb-1">
                          Email (System ID)
                        </label>
                        <input
                          className="form-control arcade-input"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                      {!isStudent && (
                        <div className="col-12">
                          <label className="text-yellow small uppercase mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            className="form-control arcade-input"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                            }
                          />
                        </div>
                      )}
                      <div className="col-12">
                        <label className="text-yellow small uppercase mb-1">
                          Biography (Bio)
                        </label>
                        <textarea
                          className="form-control arcade-input"
                          rows="3"
                          value={formData.profile.Bio}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: { Bio: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-success flex-grow-1 fw-bold">
                        SYNC_CHANGES
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline-secondary px-4">
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="stats-view">
                    <div className="row text-center g-3 mb-4">
                      {isStudent ? (
                        <>
                          <div className="col-6 border-end border-secondary">
                            <p className="text-secondary small mb-0 uppercase tracking-tighter">
                              Rank
                            </p>
                            <h3 className="text-white">
                              {profile.extra_info.level_name}
                            </h3>
                          </div>
                          <div className="col-6">
                            <p className="text-secondary small mb-0 uppercase tracking-tighter">
                              Total XP
                            </p>
                            <h3 className="text-cyan">
                              {profile.extra_info.StudentPoints}
                            </h3>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-4 border-end border-secondary">
                            <p className="text-secondary small mb-0">
                              STAR POINTS
                            </p>
                            <h2 className="text-warning fw-bold tracking-tight">
                              {profile.extra_info.StarTotalPoints}
                            </h2>
                          </div>
                          <div className="col-4 border-end border-secondary">
                            <p className="text-secondary small mb-0">RANK</p>
                            {/* الرتبة كبيرة كما طلبت */}
                            <h2 className="text-white fw-bold uppercase tracking-tight">
                              {profile.extra_info.star_level_name}
                            </h2>
                          </div>
                          <div className="col-4">
                            <p className="text-secondary small mb-0">AGE</p>
                            <h2 className="text-white">
                              {profile.extra_info.Age}
                            </h2>
                          </div>
                          <div className="col-12">
                            <hr className="border-secondary opacity-25 my-1" />
                          </div>
                          <div className="col-4 border-end border-secondary">
                            <p className="text-success small mb-0">ADDED</p>
                            <h2 className="text-success">
                              {profile.extra_info.QuestionsAdded}
                            </h2>
                          </div>
                          <div className="col-4 border-end border-secondary">
                            <p className="text-primary small mb-0">EDITED</p>
                            <h2 className="text-primary">
                              {profile.extra_info.QuestionsEdited}
                            </h2>
                          </div>
                          <div className="col-4">
                            <p className="text-danger small mb-0">DELETED</p>
                            <h2 className="text-danger">
                              {profile.extra_info.QuestionsDeleted}
                            </h2>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bio-box bg-black-op p-3 border border-secondary rounded">
                      <p className="text-yellow small mb-1 uppercase tracking-widest">
                        User Biography
                      </p>
                      <p className="mb-0 italic opacity-75">
                        {profile.profile.Bio || "No database logs for bio..."}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline-warning w-100 mt-4 fw-bold arcade-btn">
                      ENTER_EDIT_MODE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
