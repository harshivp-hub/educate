import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password
      });

      if (response.status === 200) {
        const { userId } = response.data;
        navigate(`/home`);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', {
          callback: resolve,
          onerror: reject,
          timeout: 10000, // 10 seconds timeout
        });
      });
  
      const googleAuth = await window.gapi.auth2.getAuthInstance();
      if (!googleAuth) {
        throw new Error('Failed to get Google Auth instance');
      }
  
      const googleUser = await googleAuth.signIn();
      const token = googleUser.getAuthResponse().id_token;
  
      const response = await axios.post('http://localhost:3001/api/users/google-login', {
        token
      });
  
      if (response.status === 200) {
        const { userId } = response.data;
        navigate(`/home/${userId}`);
      } else {
        alert('Google login failed.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed.');
    }
  };
  
  
  return (
    <div className="container">
      <div className="black-section">
        <h1>Padh.<span style={{ fontWeight: "normal" }}>ai</span></h1>
        <p>Teachers are meant to teach</p>
      </div>
      <div className="white-section">
        <p>Welcome back,<br />Please login to access your portal</p>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-container">
            <label htmlFor="email">Email ID:</label><br />
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <label htmlFor="password">Password:</label><br />
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">Login</button>
          <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
            Login with Google
          </button>
          <Link to="/register" className="register-user">Register User</Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
