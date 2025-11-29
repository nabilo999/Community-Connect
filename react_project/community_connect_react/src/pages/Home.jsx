import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Home() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Jane Doe',
      avatar: '../../assets/pfp_2.png',
      text: "Excited for our upcoming community cleanup this weekend! Let's make our park beautiful again 🌳",
      image: '../../assets/banner_img.png',
      comments: [
        { id: 1, author: 'Alex Kim', text: 'Count me in! What time does it start?', avatar: '../../assets/pfp_5.png' }
      ]
    },
    {
      id: 2,
      author: 'Alex Kim',
      avatar: '../../assets/pfp_5.png',
      text: 'Thanks to everyone who joined the local fundraiser! We raised over $2,000 for the shelter ❤️',
      image: null,
      comments: []
    }
  ]);

  const [composerText, setComposerText] = useState('');

  useEffect(() => {
    // placeholder for future enhancements
  }, []);

  function addPost() {
    const text = composerText.trim();
    if (!text) {
      alert('Please type something before posting!');
      return;
    }
    const newPost = {
      id: Date.now(),
      author: 'You',
      avatar: '../../assets/pfp_1.png',
      text,
      image: null,
      comments: []
    };
    setPosts([newPost, ...posts]);
    setComposerText('');
  }

  function addComment(postId, text) {
    if (!text.trim()) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), author: 'You', text, avatar: '../../assets/pfp_1.png' }] } : p))
    );
  }

  return (
  <>
  <Header/>
    <main>
      
      <Sidebar/>
      
      <section className="feed">
        <div className="composer">
          <img src="../../assets/pfp_1.png" alt="Profile" />
          <textarea rows="2" value={composerText} onChange={(e) => setComposerText(e.target.value)} placeholder="Share an update..."></textarea>
          <div className="buttons">
            <button title="Attach">📎</button>
            <button title="Send" onClick={addPost}>➤</button>
          </div>
        </div>

        <br />

        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <img src={post.avatar} alt="User" />
              <h4>{post.author}</h4>
            </div>
            <p>{post.text}</p>
            {post.image && <img src={post.image} alt="Post" className="post-image" />}

            <div className="comment-section">
              <div className="comments-container">
                {post.comments.map((c) => (
                  <div key={c.id} className="comment">
                    <img src={c.avatar} alt="User" />
                    <div className="comment-content">
                      <strong>{c.author}</strong>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>

              <CommentInput onSend={(text) => addComment(post.id, text)} />
            </div>
          </div>
        ))}
      </section>

      <aside className="right-sidebar">
          
        <div class="card">
            <h3>Recent Events</h3>
        <div class="event">
          <div class="event-info">
            <h4>Neighborhood Cleanup</h4>
            <p>Oct 30, 2025</p>
          </div>
          <button>RSVP</button>
        </div>
        <div class="event">
          <div class="event-info">
            <h4>Food Drive</h4>
            <p>Nov 3, 2025</p>
          </div>
          <button>RSVP</button>
        </div>
        <div class="event">
          <div class="event-info">
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

function CommentInput({ onSend }) {
  const [text, setText] = useState('');
  return (
    <div className="comment-input">
      <img src="../../assets/pfp_1.png" alt="You" />
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." onKeyDown={(e) => e.key === 'Enter' && (onSend(text), setText(''))} />
      <button onClick={() => { onSend(text); setText(''); }}>➤</button>
    </div>
  );
}
