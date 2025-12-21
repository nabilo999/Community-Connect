import React, { useEffect, useState } from "react";
import "../styles/global.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

//port that we are connecting to for local or backend for prod
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AuthPage() {
  //mode controls if the form is in login or sign up state
  const [mode, setMode] = useState("login");

  // inputs for email, name, and password (name only for sign up)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //to help user stay logged in on their browser default will be set on
  const [rememberMe, setRememberMe] = useState(true);

  //in case any errors happen
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //react hooks
  const navigate = useNavigate();
  const location = useLocation();

  //read ?mode=signup or ?mode=login from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");

    if (m === "signup" || m === "login") 
    {
      setMode(m);
    } else 
    {
      //default if nothing provided
      setMode("login");
    }
  }, [location.search]);

  async function handleSubmit(e) 
  {
    //make sure default form is not reloaded
    e.preventDefault();
    //remove error messages
    setError("");
    //show the please wait so user knows the form is being accepted
    setLoading(true);

    try 
    {
      //mode will determine either to call login or sign up
      const endpoint =
        mode === "signup" ? "/api/auth/register" : "/api/auth/login";

      //sign up needs name email and password and login only email and password
      const body =
        mode === "signup" ? { name, email, password } : { email, password };

      //we send a POST request to our mongodb
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      //handles response from db
      const data = await res.json().catch(() => null);

      //edge case if we get an error from db
      if (!res.ok) 
      {
        throw new Error(data?.message || "Authentication failed");
      }

      //storing information about the user (rememberMe determines storage)
      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      storage.setItem("cc_token", data.token);
      storage.setItem("cc_user", JSON.stringify(data.user));

      //take user to the home feed
      navigate("/home");
    } catch (err) 
    {
      setError(err.message || "Authentication failed");
    } finally 
    {
      setLoading(false);
    }
  }

  //returning everything for react
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              className="auth-input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="auth-input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="auth-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Stay signed in on this device
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-login-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="auth-link-container">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate("/auth?mode=login")}
              >
                Login
              </button>
            </>
          )}
        </div>

        <div className="auth-link-container">
          <Link className="auth-link" to="/">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}