import React, { useState } from 'react';
import '../styles/global.css';
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Groups() {
  const [userGroups, setUserGroups] = useState([
    { id: 1, name: 'Garden Club', img: '/assets/post_1.jpg' },
    { id: 2, name: 'Volunteers', img: '/assets/volunteer.jpg' }
  ]);

  const [exploreGroups, setExploreGroups] = useState([
    { id: 3, name: 'Baking Club', img: '/assets/pie.png' },
    { id: 4, name: 'Neighborhood Watch', img: '/assets/megaphone_ic.png' },
    { id: 5, name: 'Book Club', img: '/assets/post_1.jpg' },
    { id: 6, name: 'Tech Meetup', img: '/assets/volunteer.jpg' }
  ]);

  function joinGroup(groupId) {
    const group = exploreGroups.find((g) => g.id === groupId);
    if (group) {
      setUserGroups((prev) => [...prev, group]);
      setExploreGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  }

  return (
    <>
      <Header />
      <main>
        <Sidebar />

        <section className="feed">
          <h1>Community Groups</h1>
          <p>Explore and manage your local groups or create a new one.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            {/* Your Groups Card */}
            <div className="card">
              <h3>Your Groups</h3>
              <div id="userGroupGrid" className="group-grid">
                {userGroups.map((g) => (
                  <div key={g.id} className="group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                    <img src={g.img} alt={g.name} />
                    <p>{g.name}</p>
                    <button style={{ padding: '0.5rem', backgroundColor: '#4cab74', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore Groups Card */}
            <div className="card">
              <h3>Explore Groups</h3>
              <div id="exploreGroupGrid" className="group-grid">
                {exploreGroups.map((g) => (
                  <div key={g.id} className="group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                    <img src={g.img} alt={g.name} />
                    <p>{g.name}</p>
                    <button onClick={() => joinGroup(g.id)} style={{ padding: '0.5rem', backgroundColor: '#0074e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Join</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
