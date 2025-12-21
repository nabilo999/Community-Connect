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

  const toggleTheme = (e) => {
    e.preventDefault();
    setDark(!dark);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    // clear saved session so user is no longer signed in
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
    sessionStorage.removeItem("cc_token");
    sessionStorage.removeItem("cc_user");
    navigate("/auth"); // go to login page
  };

  return (
    <header className="top-nav">
  <div className="logo">
    <span className="logo-text">Comm</span>
    <span className="logo-square">U</span>
    <span className="logo-text">nityConnect</span>
  </div>

      <div className="header-right">
        <Link to="/settings" className="header-link">
          <i className="fa-solid fa-gear"></i>&nbsp; Settings
        </Link>

        <a onClick={toggleTheme} className="header-link theme-toggle" aria-label="Toggle theme">
          <i className="fa-solid fa-moon"></i>&nbsp; Theme
        </a>

        <a href="#" onClick={handleLogout} className="header-link">
          <i className="fa-solid fa-sign-out"></i>&nbsp; Log Out
        </a>
      </div>
    </header>
  );
};

export default Header;