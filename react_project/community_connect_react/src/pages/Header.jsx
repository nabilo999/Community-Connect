import React from 'react'

const Header = () => {
  return (
    <header>
        <div class="logo">
        <img src="images/logo_2_Unity.png" alt="CommunityConnect Logo" />
        </div>
        <div class="nav-links">
        <a href="#" id="themeToggle"><i class="fa-solid fa-moon"></i> Theme</a>
        <a href="Settings.html">Settings</a>
        <a href="index.html">Log Out</a>
        </div>
    </header>
  )
}

export default Header