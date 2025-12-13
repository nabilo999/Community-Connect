import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import Sidebar from "./Sidebar";
import Header from "./Header";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; //connections

// Default user (used if no logged-in user is stored)
const DEFAULT_USER = {
  id: "demo-user-1",
  name: "You",
  avatarUrl: "/assets/pfp_1.png"
};

// helper: load current user from localStorage
function loadCurrentUser() {
  try {
    const raw = window.localStorage.getItem("cc_user");
    if (!raw) return DEFAULT_USER;

    const user = JSON.parse(raw);
    return {
      id: user.id || DEFAULT_USER.id,
      name: user.name || DEFAULT_USER.name,
      avatarUrl: user.avatarUrl || DEFAULT_USER.avatarUrl
    };
  } catch (e) {
    console.error("Failed to read cc_user from localStorage", e);
    return DEFAULT_USER;
  }
}

// helper: build headers including Authorization if we have a token
function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = window.localStorage.getItem("cc_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch (e) {
    console.error("Failed to read cc_token from localStorage", e);
  }
  return headers;
}

function safeAvatar(src, fallback = "/assets/pfp_2.png") {
  return src && typeof src === "string" && src.trim() ? src : fallback;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [posts, setPosts] = useState([]);
  const [composerText, setComposerText] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageData, setImageData] = useState([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState('');

  // load user once from localStorage when component mounts
  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  // NEW: refresh user when Profile saves changes (or localStorage changes)
  useEffect(() => {
    function refreshUser() {
      setCurrentUser(loadCurrentUser());
    }

    function onStorage(e) {
      if (e.key === "cc_user") refreshUser();
    }

    window.addEventListener("cc_user_updated", refreshUser);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cc_user_updated", refreshUser);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  //load all the posts from the backend
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoadingPosts(true);
        const res = await fetch(`${API_BASE}/api/posts`, {
          headers: getAuthHeaders()
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch posts');
        }
        setPosts(data || []);
      } catch (err) {
        console.error(err);
        setError('Could not load posts. Please try again later.');
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, []);

  //function to handle image changes - supports up to 4 images
  function handleImageChange(e) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Limit to 4 images total
      if (imageData.length >= 4) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleCreatePost() {
    const text = composerText.trim();
    if (!text) {
      alert('Please type something before posting!');
      return;
    }

    setLoadingPost(true);
    setError('');

    try {
      // use the current time as the event/post time
      const now = new Date().toISOString();

      const body = {
        userId: currentUser.id,
        authorName: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        description: text,
        eventTime: now,
        location,
        images: imageData
      };

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      const newPost = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(newPost?.message || 'Failed to create post');
      }

      setPosts((prev) => [newPost, ...prev]);

      //reset composer
      setComposerText('');
      setLocation('');
      setImageData([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'There was a problem creating your post.');
    } finally {
      setLoadingPost(false);
    }
  }

  async function handleAddComment(postId, text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: currentUser.id,
          authorName: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          text: trimmed
        })
      });

      const updatedPost = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(updatedPost?.message || 'Failed to add comment');
      }

      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'There was a problem adding your comment.');
    }
  }

  async function handleDeleteComment(postId, commentId) {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId: currentUser.id })
        }
      );

      const updatedPost = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(updatedPost?.message || 'Failed to delete comment');
      }

      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'There was a problem deleting your comment.');
    }
  }

  //func to delete post and all of its comments
  async function handleDeletePost(postId) {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: currentUser.id })
      });

      const data = await res.json().catch(() => null);

      //if issue deleting post
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete post');
      }

      //remove post from local
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error(err);
      setError(err.message || 'There was a problem deleting your post.');
    }
  }

  return (
    <>
      <Header />
      <main>
        <Sidebar />

        <section className="feed">
          <div className="composer">
            <div className="composer-top">
              <img
                src={safeAvatar(currentUser.avatarUrl, DEFAULT_USER.avatarUrl)}
                alt={currentUser.name}
              />
              <textarea
                rows="2"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Share an update..."
              />
            </div>
            {imageData.length > 0 && (
              <div className="composer-image-preview">
                {imageData.map((img, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={img} alt={`Preview ${idx}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => setImageData((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="composer-bottom">
              <label className="file-input-label">
                <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
                <span className="plus-icon">+</span>
              </label>
              <button onClick={handleCreatePost} disabled={loadingPost}>
                {loadingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          {loadingPosts && <p>Loading posts...</p>}

          {posts.map((post) => (
            <div key={post._id} className="post">
              <div className="post-header">
                <div className="post-header-left">
                  <img
                    src={safeAvatar(post.avatarUrl, "/assets/pfp_2.png")}
                    alt={post.authorName}
                  />
                  <div>
                    <h4>{post.authorName}</h4>
                    {(post.eventTime || post.location) && (
                      <p style={{ fontSize: '0.85rem', color: '#555' }}>
                        {post.eventTime && formatEventTime(post.eventTime)}
                        {post.eventTime && post.location && ' • '}
                        {post.location}
                      </p>
                    )}
                  </div>
                </div>

                {post.userId === currentUser.id && (
                  <button
                    className="post-delete-button"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              <p>{post.description}</p>

              {(post.images && post.images.length > 0) && (
                <div className={`post-images post-images-${post.images.length}`}>
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Post image ${idx + 1}`}
                      className="post-image"
                    />
                  ))}
                </div>
              )}

              <div className="comment-section">
                {(post.comments || []).map((comment) => (
                  <div key={comment._id} className="comment">
                    <img
                      src={safeAvatar(comment.avatarUrl, "/assets/pfp_2.png")}
                      alt={comment.authorName}
                    />
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: '600',
                            marginRight: '0.5rem'
                          }}
                        >
                          {comment.authorName}
                        </span>
                        {comment.userId === currentUser.id && (
                          <button
                            onClick={() =>
                              handleDeleteComment(post._id, comment._id)
                            }
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#999',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div>{comment.text}</div>
                    </div>
                  </div>
                ))}

                <CommentInput
                  currentUser={currentUser}
                  onSend={(text) => handleAddComment(post._id, text)}
                />
              </div>
            </div>
          ))}
        </section>

        <aside className="right-sidebar">
          <div className="card">
            <h3>testing state</h3>
            <div className="event">
              <div className="event-info">
                <h4>Neighborhood Cleanup</h4>
                <p>Oct 30, 2025</p>
              </div>
              <button>RSVP</button>
            </div>
            <div className="event">
              <div className="event-info">
                <h4>Food Drive</h4>
                <p>Nov 3, 2025</p>
              </div>
              <button>RSVP</button>
            </div>
            <div className="event">
              <div className="event-info">
                <h4>Holiday Meetup</h4>
                <p>Dec 10, 2025</p>
              </div>
              <button>RSVP</button>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}

function CommentInput({ onSend, currentUser }) {
  const [text, setText] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim()) return;
      onSend(text);
      setText('');
    }
  }

  return (
    <div className="comment-input">
      <img
        src={safeAvatar(currentUser.avatarUrl, "/assets/pfp_1.png")}
        alt={currentUser.name}
      />
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
          setText('');
        }}
      >
        ➤
      </button>
    </div>
  );
}

// Helpers
function formatEventTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}