import '../styles/global.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [dark]);

  const toggleTheme = () => {
    setDark(!dark);
  };

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
    sessionStorage.removeItem("cc_token");
    sessionStorage.removeItem("cc_user");
    navigate("/auth");
  };

  return (
    <header className="top-nav">
      {/* Logo */}
      <div className="logo">
        <span className="logo-text">Comm</span>
        <span className="logo-square">U</span>
        <span className="logo-text">nityConnect</span>
      </div>

      {/* Right side */}
      <div className="header-right">
        {/* Desktop links */}
        <div className="desktop-only header-links">
          <Link to="/settings" className="header-link">
            <i className="fa-solid fa-gear"></i>&nbsp; Settings
          </Link>

          <button onClick={toggleTheme} className="header-link">
            <i className="fa-solid fa-moon"></i>&nbsp; Theme
          </button>

          <button onClick={handleLogout} className="header-link">
            <i className="fa-solid fa-sign-out"></i>&nbsp; Log Out
          </button>
        </div>

        {/* Mobile menu */}
        <div className="mobile-only mobile-menu">
          <button className="menu-btn">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>

          <div className="menu-dropdown">
            <Link to="/settings" className="menu-settings">
              <i className="fa-solid fa-gear"></i> Settings
            </Link>

            <button onClick={toggleTheme} className="menu-theme">
              <i className="fa-solid fa-moon"></i> Toggle Theme
            </button>

            <button onClick={handleLogout} className="menu-logout">
              <i className="fa-solid fa-right-from-bracket"></i> Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
