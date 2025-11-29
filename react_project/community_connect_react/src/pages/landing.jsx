import React from 'react';
import '../styles/global.css';
import { Link } from "react-router-dom";


export default function Landing() {
	return (
		<div>
			<header>
				<div className="logo">
					<img src="../../assets/logo_2_Unity.png" alt="CommunityConnect Logo" />
				</div>
				<div className="nav-buttons">
                    <Link to="/">
                    <i></i>&nbsp; Sign Up
                    </Link>

                    <Link to="/">
                    <i></i>&nbsp; Login
                    </Link>
					
				</div>
			</header>

			<section className="banner">
				<div className="banner-overlay" />
				<div className="banner-content">
					<h1>Connect. Act. Thrive</h1>
					<p>Your platform for collective action</p>
					<div className="banner-buttons">
						<a href="#">Join Community</a>
						<a href="#">Create Community</a>
					</div>
				</div>
			</section>

			<section className="how-it-works">
				<h2>How It Works</h2>
				<div className="cards">
					<div className="card">
						<img src="../../assets/bubble_ic.png" alt="Connect" />
						<h3>Connect</h3>
						<p>Join local or interest-based communities to share ideas, updates, and opportunities for collective action.</p>
					</div>
					<div className="card">
						<img src="../../assets/calandar_ic.png" alt="Organize" />
						<h3>Organize</h3>
						<p>Plan events, fundraisers, or discussions with tools that make coordination easy and transparent.</p>
					</div>
					<div className="card">
						<img src="../../assets/megaphone_ic.png" alt="Decide" />
						<h3>Decide Together</h3>
						<p>Run polls, discussions, and votes to ensure every voice matters and decisions are community-driven.</p>
					</div>
				</div>
			</section>

			<footer>
				<a href="#">About Us</a>
				<a href="#">Privacy</a>
				<a href="#">Feedback</a>
			</footer>
		</div>
	);
}

