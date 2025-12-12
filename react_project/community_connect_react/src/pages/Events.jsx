import React, { useEffect, useMemo, useState } from "react";
import "../styles/global.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEFAULT_USER = {
  id: "demo-user-1",
  name: "You",
  avatarUrl: "../../assets/pfp_1.png",
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

export default function Events() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser] = useState(loadCurrentUser());

  const params = new URLSearchParams(location.search);
  const groupId = params.get("group");

  const isGroupMode = Boolean(groupId);

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [place, setPlace] = useState("");
  const [imageData, setImageData] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

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

        const groups = mine || [];
        const results = await Promise.all(
          groups.map(async (g) => {
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

  function onPickImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageData(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function createEvent() {
    // only allowed in group mode
    if (!isGroupMode) return;

    const t = title.trim();
    const d = desc.trim();
    if (!t || !d) return alert("Please enter a title and description.");

    try {
      setPosting(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/groups/${groupId}/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: t,
          description: d,
          eventTime,
          location: place,
          image: imageData,
        }),
      });

      const created = await res.json().catch(() => null);
      if (!res.ok) throw new Error(created?.message || "Failed to create event");

      //if there is a group name attach it 
      const tagged = {
        ...created,
        _groupName: group?.name || "Group",
        _groupId: groupId,
      };

      setEvents((prev) => [tagged, ...prev]);

      setTitle("");
      setDesc("");
      setEventTime("");
      setPlace("");
      setImageData("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not create event.");
    } finally {
      setPosting(false);
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

  async function addComment(ev, text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const gid = ev.groupId || ev._groupId || groupId;

    try {
      const res = await fetch(`${API_BASE}/api/groups/${gid}/events/${ev._id}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: trimmed }),
      });

      const updated = await res.json().catch(() => null);
      if (!res.ok) throw new Error(updated?.message || "Failed to add comment");

      const patched = {
        ...updated,
        _groupName: ev._groupName,
        _groupId: ev._groupId || String(updated.groupId),
      };

      setEvents((prev) => prev.map((x) => (x._id === patched._id ? patched : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not add comment.");
    }
  }

  async function deleteComment(ev, commentId) {
    const gid = ev.groupId || ev._groupId || groupId;

    try {
      const res = await fetch(
        `${API_BASE}/api/groups/${gid}/events/${ev._id}/comments/${commentId}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );

      const updated = await res.json().catch(() => null);
      if (!res.ok) throw new Error(updated?.message || "Failed to delete comment");

      const patched = {
        ...updated,
        _groupName: ev._groupName,
        _groupId: ev._groupId || String(updated.groupId),
      };

      setEvents((prev) => prev.map((x) => (x._id === patched._id ? patched : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not delete comment.");
    }
  }

  const upcoming = useMemo(() => {
    const now = new Date();
    return (events || [])
      .filter((e) => e.eventTime && !Number.isNaN(new Date(e.eventTime).getTime()))
      .map((e) => ({ ...e, _dt: new Date(e.eventTime) }))
      .filter((e) => e._dt >= now)
      .sort((a, b) => a._dt - b._dt)
      .slice(0, 7);
  }, [events]);

  return (
    <>
      <Header />
      <main>
        <Sidebar />

        <section className="feed">
          <h1>
            {isGroupMode
              ? `${group?.name || "Group"} Events`
              : "Your Group Events"}
          </h1>

          <p>
            {isGroupMode
              ? "Post events for your group and discuss them in the comments."
              : "View events from all groups you are in. To create an event, go to Groups → View."}
          </p>

          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
          {loading && <p style={{ marginTop: "1rem" }}>Loading events...</p>}

          {/*creating an event when you are on group tab*/}
          {isGroupMode && (
            <div className="composer" style={{ marginTop: "1.5rem" }}>
              <img src={currentUser.avatarUrl} alt={currentUser.name} />

              <div style={{ flex: 1 }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  style={{
                    width: "100%",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                />

                <textarea
                  rows="2"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Event description..."
                  style={{
                    width: "100%",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: "0.5rem",
                  }}
                />

                <div className="buttons">
                  <input
                    type="datetime-local"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                  <input type="file" accept="image/*" onChange={onPickImage} />
                  <button onClick={createEvent} disabled={posting}>
                    {posting ? "Posting..." : "Post Event"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*feed for events*/}
          {!loading && events.length === 0 && (
            <p style={{ color: "#666", marginTop: "1.5rem" }}>
              No events yet.
            </p>
          )}

          {events.map((ev) => (
            <div key={ev._id} className="post">
              <div className="post-header">
                <div className="post-header-left">
                  <img src={ev.avatarUrl || "../../assets/pfp_2.png"} alt={ev.authorName} />
                  <div>
                    <h4>
                      {ev.authorName}
                      {/*show all groups when you click group tab*/}
                      {!isGroupMode && ev._groupName && (
                        <span style={{ fontWeight: 400, color: "#666" }}>
                          {" "}• {ev._groupName}
                        </span>
                      )}
                    </h4>

                    <p style={{ fontSize: "0.85rem", color: "#555" }}>
                      <strong>{ev.title}</strong>
                      {(ev.eventTime || ev.location) && (
                        <>
                          {" "}
                          • {ev.eventTime ? formatEventTime(ev.eventTime) : ""}
                          {ev.eventTime && ev.location ? " • " : ""}
                          {ev.location || ""}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/*deletion for posts by author*/}
                {String(ev.userId) === String(currentUser.id) && (
                  <button className="post-delete-button" onClick={() => deleteEvent(ev)}>
                    Delete
                  </button>
                )}
              </div>

              <p>{ev.description}</p>

              {ev.image && <img src={ev.image} alt="Event attachment" className="post-image" />}

              {/*comments for events*/}
              <div className="comment-section">
                {(ev.comments || []).map((c) => (
                  <div key={c._id} className="comment">
                    <img src={c.avatarUrl || currentUser.avatarUrl} alt={c.authorName} />
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600 }}>{c.authorName}</span>
                        {String(c.userId) === String(currentUser.id) && (
                          <button
                            onClick={() => deleteComment(ev, c._id)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#999",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div>{c.text}</div>
                    </div>
                  </div>
                ))}

                <CommentInput
                  currentUser={currentUser}
                  onSend={(text) => addComment(ev, text)}
                />
              </div>
            </div>
          ))}
        </section>

        {/*show upcoming events*/}
        <aside className="right-sidebar">
          <div className="card">
            <h3>Upcoming Events</h3>

            {upcoming.length === 0 ? (
              <p style={{ color: "#666" }}>No upcoming events yet.</p>
            ) : (
              upcoming.map((e) => (
                <div key={e._id} className="event">
                  <div className="event-info">
                    <h4>
                      {e.title}
                      {!isGroupMode && e._groupName && (
                        <span style={{ fontWeight: 400, color: "#666" }}>
                          {" "}• {e._groupName}
                        </span>
                      )}
                    </h4>
                    <p>{formatEventTime(e.eventTime)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </>
  );
}

function CommentInput({ onSend, currentUser }) {
  const [text, setText] = useState("");

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim()) return;
      onSend(text);
      setText("");
    }
  }

  return (
    <div className="comment-input">
      <img src={currentUser.avatarUrl} alt={currentUser.name} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment..."
      />
      <button
        onClick={() => {
          if (!text.trim()) return;
          onSend(text);
          setText("");
        }}
      >
        ➤
      </button>
    </div>
  );
}

function formatEventTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}