import React from 'react';
import "../styles/global.css";
import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="left-sidebar">
            <div className="nav-card">
                <Link to="/home" className="nav-item">
                    <i className="fa-solid fa-house"></i>&nbsp; Home
                </Link>

                <Link to="/groups" className="nav-item">
                    <i className="fa-solid fa-users"></i>&nbsp; Groups
                </Link>

                <Link to="/events" className="nav-item">
                    <i className="fa-solid fa-calendar-days"></i>&nbsp; Events
                </Link>

                <Link to="/profile" className="nav-item">
                    <i className="fa-solid fa-user"></i>&nbsp; Profile
                </Link>

                <Link to="/settings" className="nav-item">
                    <i className="fa-solid fa-gear"></i>&nbsp; Settings
                </Link>
            </div>
        </aside>
    );
}

export default Sidebar;
