import React from 'react'
import '../styles/global.css';

const Header = () => {
  return (
    <header>
        <div className="logo">
        <img src='../../assets/logo_2_Unity.png'alt="CommunityConnect Logo" />
        </div>
        <div className="nav-links">
        <a href="#" id="themeToggle"><i className="fa-solid fa-moon"></i> Theme</a>
        <a href="Settings.html">Settings</a>
        <a href="index.html">Log Out</a>
        </div>
    </header>
  )
}

export default Header