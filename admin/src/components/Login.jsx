import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard"); // redirect after login
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <img src={logo} alt="Logo" className="login-logo" />
      </header>

      <main className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Log In
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <p>© 2025 Ngultrum Classification | All rights reserved</p>
      </footer>
    </div>
  );
};

export default Login;
