import React, { useEffect, useState } from 'react';
import '../../../../pre_react_files/Home.css';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emails, setEmails] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('userSettings'));
      if (saved) {
        setNotifications(!!saved.notifications);
        setEmails(!!saved.emails);
        setPrivateProfile(!!saved.privateProfile);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function saveSettings() {
    const settings = { notifications, emails, privateProfile };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  function resetTheme() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    alert('Theme reset to light mode 🌞');
  }

  return (
    <main>
      <aside className="left-sidebar">
        <div className="nav-card">
          <a href="#" className="nav-item">Home</a>
          <a href="#" className="nav-item">Groups</a>
          <a href="#" className="nav-item">Events</a>
          <a href="#" className="nav-item">Profile</a>
          <a href="#" className="nav-item active">Settings</a>
        </div>
      </aside>

      <section className="feed">
        <h1>Settings</h1>
        <p>Manage your app preferences and account settings below.</p>

        <div className="card" style={{ maxWidth: 600, marginTop: '2rem' }}>
          <h3>Preferences</h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
            <label>🔔 Enable Notifications</label>
            <input type="checkbox" id="notifToggle" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
            <label>✉️ Email Updates</label>
            <input type="checkbox" id="emailToggle" checked={emails} onChange={(e) => setEmails(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
            <label>🔒 Private Profile</label>
            <input type="checkbox" id="privacyToggle" checked={privateProfile} onChange={(e) => setPrivateProfile(e.target.checked)} />
          </div>

          <hr style={{ margin: '1.5rem 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button id="saveSettingsBtn" onClick={saveSettings}>💾 Save Settings</button>
            <button id="resetThemeBtn" style={{ backgroundColor: '#d9534f' }} onClick={resetTheme}>↺ Reset Theme</button>
          </div>
        </div>

        {showSaved && <p id="saveMessage" style={{ marginTop: '1rem', color: '#4cab74' }}>✅ Settings saved successfully!</p>}
      </section>
    </main>
  );
}
