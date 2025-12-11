import React, { useState } from "react";
import "../styles/global.css";
import { Link, useNavigate } from "react-router-dom";

//port that we are connecting to for local or backend for prod
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; 

export default function AuthPage() {
    //mode controls if the form is in login or sign up state
  const [mode, setMode] = useState("login"); 
  //inputs for email, name, and password (name only for sign up)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //in case any errors happen
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    //react hook
  const navigate = useNavigate();

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
        //sing up needs name email and password and login only email and password
      const body =
        mode === "signup"
          ? { name, email, password }
          : { email, password };
        //we send a POST request to our mongodb
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      //handles response from db
      const data = await res.json();
      //edge case if we get an error from db 
      if (!res.ok) 
      {
        throw new Error(data.message || "Something went wrong");
      }

      //save the user and token in the localStorage and user is logged in
      localStorage.setItem("cc_token", data.token);
      localStorage.setItem("cc_user", JSON.stringify(data.user));

      //take user to the home feed
      navigate("/home");
    } catch (err) 
    {
      setError(err.message);
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

          {error && (
            <p style={{ color: "red", fontSize: 14, marginTop: 4 }}>{error}</p>
          )}

          <button type="submit" className="auth-login-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <div className="auth-link-container">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => setMode("signup")}
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
                onClick={() => setMode("login")}
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