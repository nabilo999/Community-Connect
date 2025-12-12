import React, { useEffect, useRef, useState } from "react";
import "../styles/global.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = window.localStorage.getItem("cc_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export default function Profile() {
  const [profilePic, setProfilePic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const uploadRef = useRef(null);

  // load from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        setProfilePic(data.avatarUrl || "");
        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
      } catch (err) {
        console.error(err);
        // optional: alert(err.message)
      }
    })();
  }, []);

  function onChangePic(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result); // base64
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          email,
          bio,
          avatarUrl: profilePic,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to save profile");

      // Update localStorage so Home + posts use the latest info
      const prev = JSON.parse(localStorage.getItem("cc_user") || "{}");
      const nextUser = { ...prev, ...data.user };
      localStorage.setItem("cc_user", JSON.stringify(nextUser));

      // tell other pages (like Home) to refresh currentUser without reload
      window.dispatchEvent(new Event("cc_user_updated"));

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <Sidebar />
        <section className="feed">
          <h1>My Profile</h1>
          <p>View and update your personal information below.</p>

          <div className="card" style={{ maxWidth: 600, marginTop: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <img
                id="profilePic"
                src={profilePic || "/assets/pfp_2.png"}
                alt="Profile Picture"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <br />
              <br />
              <input
                ref={uploadRef}
                type="file"
                id="uploadPic"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onChangePic}
              />
              <button
                id="changePicBtn"
                onClick={() => uploadRef.current && uploadRef.current.click()}
              >
                📷 Change Picture
              </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <label>
                <strong>Full Name:</strong>
              </label>
              <input
                type="text"
                id="profileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.3rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />

              <label style={{ marginTop: "1rem" }}>
                <strong>Email:</strong>
              </label>
              <input
                type="email"
                id="profileEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.3rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />

              <label style={{ marginTop: "1rem" }}>
                <strong>Bio:</strong>
              </label>
              <textarea
                id="profileBio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />

              <br />
              <br />
              <button id="saveProfileBtn" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>

          {showSaved && (
            <p id="saveMessage" style={{ marginTop: "1rem", color: "#4cab74" }}>
              ✅ Profile updated successfully!
            </p>
          )}
        </section>
      </main>
    </>
  );
}