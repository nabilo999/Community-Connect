import React from "react";
import '../styles/global.css';
import { Link } from "react-router-dom";


export default function AuthPage() {
return (
<div className="auth-container">
<div className="auth-card">
<h1 className="auth-title">Welcome Back</h1>


<form className="auth-form">
<input type="email" placeholder="Email" className="auth-input-field" />


<input
type="password"
placeholder="Password"
className="auth-input-field"
/>

<button type="submit" className="auth-login-btn">
Login
</button>
</form>


<div className="auth-link-container">
<Link className="auth-link" to="/"><i></i>Forgot Password?</Link></div>

<div className="auth-link-container">
Don’t have an account? <Link className="auth-link" to="/"><i></i>Sign Up</Link>

</div>
</div>
</div>
);
}