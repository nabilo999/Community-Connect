import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/global.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

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

export default function Groups() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [currentUser] = useState(loadCurrentUser());

  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newImageData, setNewImageData] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        //get all groups
        const resAll = await fetch(`${API_BASE}/api/groups`);
        const groups = await resAll.json().catch(() => []);
        if (!resAll.ok) throw new Error(groups?.message || "Failed to load groups");

        //user should be logged in to access but just in case they can still see all groups
        const token = window.localStorage.getItem("cc_token");
        if (!token) {
          setAllGroups(groups || []);
          setMyGroups([]);
          return;
        }

        //get all users groups
        const resMine = await fetch(`${API_BASE}/api/groups/mine`, {
          headers: getAuthHeaders(),
        });
        const mine = await resMine.json().catch(() => []);
        if (!resMine.ok) throw new Error(mine?.message || "Failed to load your groups");

        setAllGroups(groups || []);
        setMyGroups(mine || []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const myIds = useMemo(() => new Set(myGroups.map((g) => g._id)), [myGroups]);

  const exploreGroups = useMemo(
    () => allGroups.filter((g) => !myIds.has(g._id)),
    [allGroups, myIds]
  );

  function onPickImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setNewImageData(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function createGroup() {
    const name = newName.trim();
    if (!name) return alert("Please enter a group name.");

    const token = window.localStorage.getItem("cc_token");
    if (!token) return navigate("/auth");

    try {
      setCreating(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/groups`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, image: newImageData }),
      });

      const created = await res.json().catch(() => null);
      if (!res.ok) throw new Error(created?.message || "Failed to create group");

      setAllGroups((prev) => [created, ...prev]);
      setMyGroups((prev) => [created, ...prev]);

      setNewName("");
      setNewImageData("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not create group");
    } finally {
      setCreating(false);
    }
  }

  async function joinGroup(groupId) {
    const token = window.localStorage.getItem("cc_token");
    if (!token) return navigate("/auth");

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const updated = await res.json().catch(() => null);
      if (!res.ok) throw new Error(updated?.message || "Failed to join group");

      //adding to your groups
      setMyGroups((prev) => [updated, ...prev.filter((g) => g._id !== groupId)]);
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not join group");
    }
  }

  async function leaveGroup(groupId) {
    const token = window.localStorage.getItem("cc_token");
    if (!token) return navigate("/auth");
    if (!window.confirm("Leave this group?")) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const updated = await res.json().catch(() => null);
      if (!res.ok) throw new Error(updated?.message || "Failed to leave group");

      //removing a group
      setMyGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not leave group");
    }
  }

  function viewGroup(groupId) {
    //for group specific events
    navigate(`/events?group=${groupId}`);
  }

  return (
    <>
      <Header />
      <main>
        <Sidebar />

        <section className="feed">
          <h1>Community Groups</h1>
          <p>Explore and manage your local groups or create a new one.</p>

          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
          {loading && <p style={{ marginTop: "1rem" }}>Loading groups...</p>}

          <div className="groups-two-col">
            <div className="card">
              <h3>Your Groups</h3>

              {myGroups.length === 0 && !loading ? (
                <p style={{ color: "#666" }}>You haven't joined any groups yet.</p>
              ) : (
                <div className="group-grid">
                  {myGroups.map((g) => (
                    <div key={g._id} className="group group-tile">
                      <button
                        className="group-leave-btn"
                        title="Leave group"
                        onClick={() => leaveGroup(g._id)}
                      >
                        ×
                      </button>

                      <img src={g.image || "/assets/logo_1_Unity.png"} alt={g.name} />
                      <p>{g.name}</p>

                      <button className="group-action-btn" onClick={() => viewGroup(g._id)}>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3>Explore Groups</h3>

              {exploreGroups.length === 0 && !loading ? (
                <p style={{ color: "#666" }}>No more groups to join right now.</p>
              ) : (
                <div className="group-grid">
                  {exploreGroups.map((g) => (
                    <div key={g._id} className="group group-tile">
                      <img src={g.image || "/assets/logo_1_Unity.png"} alt={g.name} />
                      <p>{g.name}</p>
                      <button className="group-action-btn" onClick={() => joinGroup(g._id)}>
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: "2rem" }}>
            <h3>Create a Group</h3>

            <div className="composer group-create-composer" style={{ marginTop: "1rem" }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                type="text"
                placeholder="Group name..."
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: "0.5rem",
                }}
              />

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickImage}
                style={{ marginLeft: "0.5rem" }}
              />

              <button
                id="addGroupBtn"
                onClick={createGroup}
                disabled={creating}
                style={{ marginLeft: "0.5rem" }}
              >
                {creating ? "Creating..." : "➕ Create"}
              </button>
            </div>

            {newImageData && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <img
                  src={newImageData}
                  alt="Group preview"
                  style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover" }}
                />
                <p style={{ color: "#666" }}>Preview</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}