import React, { useState } from 'react';
import '../styles/global.css';
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Groups() {
  const [groups, setGroups] = useState([
    { id: 1, name: 'Garden Club', img: '../../assets/post_1.jpg' },
    { id: 2, name: 'Volunteers', img: '../../assets/volunteer.jpg' },
    { id: 3, name: 'Baking Club', img: '../../assets/pie.png' },
    { id: 4, name: 'Neighborhood Watch', img: '../../assets/megaphone_ic.png' }
  ]);

  const [name, setName] = useState('');
  const [img, setImg] = useState('');

  function addGroup() {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('Please enter a group name!');
      return;
    }
    const url = img.trim() || '../../assets/logo_1_Unity.png';
    const g = { id: Date.now(), name: trimmed, img: url };
    setGroups((s) => [...s, g]);
    setName('');
    setImg('');
  }

  return (
    <>
    <Header/>
      <main>
        
        <Sidebar/>


      <section className="feed">
        <h1>Community Groups</h1>
        <p>Explore and manage your local groups or create a new one.</p>

        <div className="composer" style={{ marginTop: '1.5rem' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="groupName" placeholder="Enter group name..." style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem' }} />
          <input value={img} onChange={(e) => setImg(e.target.value)} type="text" id="groupImage" placeholder="Image URL (optional)" style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', marginLeft: '0.5rem' }} />
          <button id="addGroupBtn" onClick={addGroup} style={{ marginLeft: '0.5rem' }}>➕ Add Group</button>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Your Groups</h3>
          <div id="groupGrid" className="group-grid">
            {groups.map((g) => (
              <div key={g.id} className="group">
                <img src={g.img} alt={g.name} />
                <p>{g.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
