import React, { useState } from "react";
import "../styles/global.css";
import { Link } from "react-router-dom";

function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`left-sidebar ${open ? "open" : ""}`}>
        <div className="nav-card">
          <Link to="/home" className="nav-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-house"></i>&nbsp; Home
          </Link>

          <Link to="/groups" className="nav-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-users"></i>&nbsp; Groups
          </Link>

          <Link to="/events" className="nav-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-calendar-days"></i>&nbsp; Events
          </Link>

          <Link to="/profile" className="nav-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-user"></i>&nbsp; Profile
          </Link>

          <Link to="/settings" className="nav-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-gear"></i>&nbsp; Settings
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
