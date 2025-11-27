import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Groups from './pages/Groups.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}


export default App
