import React, { useEffect, useState } from "react";
import "../styles/global.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEFAULT_USER = {
  id: "demo-user-1",
  name: "You",
  avatarUrl: "/assets/pfp_1.png",
};

function loadCurrentUser() {
  try {
    const raw = window.localStorage.getItem("cc_user");
    if (!raw) return DEFAULT_USER;
    const user = JSON.parse(raw);
    return {
      id: user.id || DEFAULT_USER.id,
      name: user.name || DEFAULT_USER.name,
      avatarUrl: user.avatarUrl || DEFAULT_USER.avatarUrl,
    };
  } catch {
    return DEFAULT_USER;
  }
}

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = window.localStorage.getItem("cc_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function safeAvatar(src, fallback = "/assets/pfp_2.png") {
  return src && typeof src === "string" && src.trim() ? src : fallback;
}

export default function Events() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser] = useState(loadCurrentUser());

  const params = new URLSearchParams(location.search);
  const groupId = params.get("group");

  const isGroupMode = Boolean(groupId);

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || "");
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  const [composerText, setComposerText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [imageData, setImageData] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Load user's groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch(`${API_BASE}/api/groups/mine`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => []);
        if (res.ok) {
          setGroups(data || []);
        }
      } catch (err) {
        console.error("Error loading groups", err);
      }
    }
    loadGroups();
  }, []);

  // Load user's joined events to track RSVP status
  useEffect(() => {
    async function loadJoinedEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/events/mine`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => []);
        if (res.ok) {
          const ids = (data || []).map((e) => String(e._id));
          setJoinedEventIds(ids);
        }
      } catch (err) {
        console.error("Error loading joined events", err);
      }
    }
    loadJoinedEvents();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        setError("");

        const token = window.localStorage.getItem("cc_token");
        if (!token) {
          navigate("/auth");
          return;
        }

        setLoading(true);

		//functionality for an individual group
        if (isGroupMode) {
          //group info 
          const resGroup = await fetch(`${API_BASE}/api/groups/${groupId}`);
          const g = await resGroup.json().catch(() => null);
          if (resGroup.ok) setGroup(g);

          // group events for members
          const res = await fetch(`${API_BASE}/api/groups/${groupId}/events`, {
            headers: getAuthHeaders(),
          });

          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error(data?.message || "Failed to load events");

          const groupName = g?.name || "Group";
          const tagged = (data || []).map((ev) => ({
            ...ev,
            _groupName: groupName,
            _groupId: groupId,
          }));

          setEvents(tagged);
          return;
        }

		//show all groups user is in 
        setGroup(null);

        //get users groups
        const resMine = await fetch(`${API_BASE}/api/groups/mine`, {
          headers: getAuthHeaders(),
        });
        const mine = await resMine.json().catch(() => []);
        if (!resMine.ok) throw new Error(mine?.message || "Failed to load your groups");

        const groupsList = mine || [];
        const results = await Promise.all(
          groupsList.map(async (g) => {
            const r = await fetch(`${API_BASE}/api/groups/${g._id}/events`, {
              headers: getAuthHeaders(),
            });
            const d = await r.json().catch(() => []);
            if (!r.ok) {
              console.error("Failed to load events for group", g._id, d);
              return [];
            }
            return (d || []).map((ev) => ({
              ...ev,
              _groupName: g.name,
              _groupId: g._id,
            }));
          })
        );

        //flatten and show newest created first
        const combined = results.flat().sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });

        setEvents(combined);
      } catch (e) {
        console.error(e);
        setError(e.message || "Could not load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [groupId, isGroupMode, navigate]);

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setImageData(compressed);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async function createEvent() {
    const text = composerText.trim();
    if (!text) {
      alert("Please enter an event description!");
      return;
    }

    const targetGroupId = isGroupMode ? groupId : selectedGroupId;
    if (!targetGroupId) {
      alert("Please select a group to create an event!");
      return;
    }

    try {
      setPosting(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/groups/${targetGroupId}/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: text.split('\n')[0] || text.substring(0, 50), // Use first line or first 50 chars as title
          description: text,
          eventTime: eventTime || "",
          location: "",
          image: imageData || "",
        }),
      });

      const created = await res.json().catch(() => null);
      if (!res.ok) throw new Error(created?.message || "Failed to create event");

      // Get group name
      const targetGroup = isGroupMode ? group : groups.find(g => String(g._id) === String(targetGroupId));
      const groupName = targetGroup?.name || "Group";

      const tagged = {
        ...created,
        _groupName: groupName,
        _groupId: targetGroupId,
      };

      setEvents((prev) => [tagged, ...prev]);

      setComposerText("");
      setEventTime("");
      setImageData("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not create event.");
    } finally {
      setPosting(false);
    }
  }

  async function handleRSVP(eventId) {
    try {
      console.log("RSVP attempt for event:", eventId);
      const res = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => null);
      console.log("RSVP response:", res.status, data);
      
      if (!res.ok) {
        const errorMsg = data?.message || `Failed to RSVP to event (${res.status})`;
        console.error("RSVP error:", errorMsg, data);
        throw new Error(errorMsg);
      }

      setJoinedEventIds((prev) => [...prev, String(eventId)]);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("RSVP error details:", err);
      setError(err.message || "There was a problem RSVPing to the event.");
    }
  }

  async function handleOptOut(eventId) {
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/leave`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        const errorMsg = data?.message || `Failed to opt out of event (${res.status})`;
        throw new Error(errorMsg);
      }

      setJoinedEventIds((prev) => prev.filter((id) => id !== String(eventId)));
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Opt out error details:", err);
      setError(err.message || "There was a problem opting out of the event.");
    }
  }

  async function deleteEvent(ev) {
    if (!window.confirm("Delete this event?")) return;

    const gid = ev.groupId || ev._groupId || groupId; // support both modes

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/groups/${gid}/events/${ev._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to delete event");

      setEvents((prev) => prev.filter((x) => x._id !== ev._id));
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not delete event.");
    }
  }


  return (
    <>
      <Header />
      <main>
        <Sidebar />

        <section className="feed">
          <h1>
            {isGroupMode
              ? `${group?.name || "Group"} Events`
              : "Events"}
          </h1>

          <p>
            {isGroupMode
              ? "Post events for your group and discuss them in the comments."
              : "View and create events from all groups you are in."}
          </p>

          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
          {loading && <p style={{ marginTop: "1rem" }}>Loading events...</p>}

          {/* Event composer */}
          <div className="composer" style={{ marginTop: "1.5rem" }}>
            <div className="composer-top">
              <img
                src={safeAvatar(currentUser.avatarUrl, DEFAULT_USER.avatarUrl)}
                alt={currentUser.name}
              />
              <textarea
                rows="2"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Share an event..."
              />
            </div>
            {imageData && (
              <div className="composer-image-preview">
                <div className="preview-item">
                  <img src={imageData} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setImageData("")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            <div className="composer-bottom">
              {!isGroupMode && (
                <select
                  className="group-select"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  aria-label="Select group to post to"
                  style={{ marginRight: 'auto' }}
                >
                  <option value="">Select a group</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              )}
              <input
                type="datetime-local"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                style={{
                  padding: "0.45rem 0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "0.9rem",
                }}
              />
              <label className="file-input-label">
                <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
                <span className="plus-icon">+</span>
              </label>
              <button onClick={createEvent} disabled={posting}>
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/*feed for events*/}
          {!loading && events.length === 0 && (
            <p style={{ color: "#666", marginTop: "1.5rem" }}>
              No events yet.
            </p>
          )}

          {events.map((ev) => {
            const isJoined = joinedEventIds.includes(String(ev._id));
            return (
              <div key={ev._id} className="event-card">
                <div className="event-card-content">
                  {ev.image && (
                    <div className="event-card-image">
                      <img src={ev.image} alt="Event" />
                    </div>
                  )}
                  <div className="event-card-body">
                    <div className="event-card-header">
                      <div className="event-card-text">
                        <p className="event-description">{ev.description}</p>
                        {!isGroupMode && ev._groupName && (
                          <p className="event-group-name">{ev._groupName}</p>
                        )}
                      </div>
                      <div className="event-card-right">
                        {ev.eventTime && (
                          <div className="event-date">
                            {formatEventTime(ev.eventTime)}
                          </div>
                        )}
                        <div className="event-actions">
                          {!isJoined && (
                            <button
                              className="event-rsvp-button"
                              onClick={() => handleRSVP(ev._id)}
                            >
                              RSVP
                            </button>
                          )}
                          {isJoined && (
                            <button
                              className="event-optout-button"
                              onClick={() => handleOptOut(ev._id)}
                            >
                              Opt out
                            </button>
                          )}
                          {String(ev.userId) === String(currentUser.id) && (
                            <button
                              className="event-delete-button"
                              onClick={() => deleteEvent(ev)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}


function formatEventTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}