import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Groups from './pages/Groups.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import Landing from './pages/landing.jsx';
import Events from './pages/Events.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/events" element={<Events />} />


    </Routes>
  );
}


export default App
