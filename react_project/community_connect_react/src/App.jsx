import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Groups from './pages/Groups.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import Landing from './pages/landing.jsx';
import Events from './pages/Events.jsx';
import Auth from './pages/Auth.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/home" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/auth" element={<Auth />} />


    </Routes>
  );
}


export default App
