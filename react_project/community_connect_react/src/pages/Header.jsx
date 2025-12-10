import '../styles/global.css';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [dark]);

  const toggleTheme = (e) => {
    e.preventDefault();
    setDark(!dark);
  };

  return (
    <header>
      <div className="logo">
        <img src='/assets/logo_2_Unity.png' alt="CommunityConnect Logo" />
      </div>

      <div className="nav-links">
        <Link to="/settings">
          <i className="fa-solid fa-gear"></i>&nbsp; Settings
        </Link>

        <a onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`}></i>&nbsp; Theme
        </a>

        <Link to="/landing">
          <i className="fa-solid fa-sign-out"></i>&nbsp; Log Out
        </Link>
      </div>
    </header>
  );
};

export default Header;
