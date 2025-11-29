import React, { useState } from 'react';
import '../styles/global.css';
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Events() {
	const [events, setEvents] = useState([
		{ id: 1, name: 'Neighborhood Cleanup', date: '2025-10-30', joined: false },
		{ id: 2, name: 'Food Drive', date: '2025-11-03', joined: false }
	]);

	const [name, setName] = useState('');
	const [date, setDate] = useState('');

	function addEvent() {
		const n = name.trim();
		if (!n || !date) {
			alert('Please fill out both the event name and date!');
			return;
		}
		const e = { id: Date.now(), name: n, date, joined: false };
		setEvents((s) => [e, ...s]);
		setName('');
		setDate('');
	}

	function joinEvent(id) {
		setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, joined: true } : ev)));
	}

	return (
        <>
        <Header/>
            <main>
            
            <Sidebar/>

			<section className="feed">
				<h1>Community Events</h1>
				<p>Plan, add, and view all upcoming community events here.</p>

				<div className="composer" style={{ marginTop: '1.5rem' }}>
					<input value={name} onChange={(e) => setName(e.target.value)} type="text" id="eventName" placeholder="Event name..." style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem' }} />
					<input value={date} onChange={(e) => setDate(e.target.value)} type="date" id="eventDate" style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', marginLeft: '0.5rem' }} />
					<button id="addEventBtn" onClick={addEvent} style={{ marginLeft: '0.5rem' }}>➕ Add Event</button>
				</div>

				<div id="eventList" style={{ marginTop: '2rem' }}>
					<div className="card">
						<h3>Upcoming Events</h3>
						{events.map((ev) => (
							<div key={ev.id} className="event">
								<div className="event-info">
									<h4>{ev.name}</h4>
									<p>{new Date(ev.date).toDateString()}</p>
								</div>
								<button onClick={() => joinEvent(ev.id)} disabled={ev.joined} style={ev.joined ? { backgroundColor: '#0074e8' } : {}}>{ev.joined ? 'Joined!' : 'RSVP'}</button>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
        </>
	);
}

