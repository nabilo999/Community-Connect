import React, { useState, useRef } from 'react';
import '../../../../pre_react_files/Home.css';

export default function Profile() {
  const [profilePic, setProfilePic] = useState('../../../../pre_react_files/images/pfp_1.png');
  const [name, setName] = useState('Maria Garcia');
  const [email, setEmail] = useState('maria.garcia@email.com');
  const [bio, setBio] = useState('Community organizer and coffee enthusiast ☕🌱');
  const [showSaved, setShowSaved] = useState(false);
  const uploadRef = useRef(null);

  function onChangePic(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  }

  function save() {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  return (
    <main>
      <aside className="left-sidebar">
        <div className="nav-card">
          <a href="#" className="nav-item">Home</a>
          <a href="#" className="nav-item">Groups</a>
          <a href="#" className="nav-item">Events</a>
          <a href="#" className="nav-item active">Profile</a>
          <a href="#" className="nav-item">Settings</a>
        </div>
      </aside>

      <section className="feed">
        <h1>My Profile</h1>
        <p>View and update your personal information below.</p>

        <div className="card" style={{ maxWidth: 600, marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <img id="profilePic" src={profilePic} alt="Profile Picture" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
            <br />
            <br />
            <input ref={uploadRef} type="file" id="uploadPic" accept="image/*" style={{ display: 'none' }} onChange={onChangePic} />
            <button id="changePicBtn" onClick={() => uploadRef.current && uploadRef.current.click()}>📷 Change Picture</button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label><strong>Full Name:</strong></label>
            <input type="text" id="profileName" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem', borderRadius: 8, border: '1px solid #ccc' }} />

            <label style={{ marginTop: '1rem' }}><strong>Email:</strong></label>
            <input type="email" id="profileEmail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem', borderRadius: 8, border: '1px solid #ccc' }} />

            <label style={{ marginTop: '1rem' }}><strong>Bio:</strong></label>
            <textarea id="profileBio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }} />

            <br />
            <br />
            <button id="saveProfileBtn" onClick={save}>💾 Save Changes</button>
          </div>
        </div>

        {showSaved && <p id="saveMessage" style={{ marginTop: '1rem', color: '#4cab74' }}>✅ Profile updated successfully!</p>}
      </section>
    </main>
  );
}
