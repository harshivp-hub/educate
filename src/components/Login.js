import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './login.css';

const clientId = '778256795761-s8j6g5kq4mevkcul0kd72jpp1fvnmoes.apps.googleusercontent.com';

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
      }, { withCredentials: true });

      if (response.status === 200) {
        const { role } = response.data; // Assuming response contains user role
        sessionStorage.setItem('userId', response.data.userId); // Store userId in session storage
        navigate(role === 'teacher' ? `/teacherhome` : `/home`);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const response = await axios.post('http://localhost:3001/api/users/google-login', { token }, { withCredentials: true });

      if (response.status === 200) {
        const { role } = response.data; // Assuming response contains user role
        sessionStorage.setItem('userId', response.data.userId); // Store userId in session storage
        navigate(role === 'teacher' ? `/teacherhome` : `/home`);
      } else {
        alert('Google login failed.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed.');
    }
  };

  const onGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    alert('Google login failed.');
  };

  return (
    <div className="container">
      <div className="black-section">
        <h1>Padh.<span style={{ fontWeight: "normal" }}>AI</span></h1>
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
          <br /><br />
          <button type="submit" className="login-button">Login</button>
          <Link to="/register" className="register-button">Register User</Link>
          <br /><br />
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleFailure}
              useOneTap
              render={(renderProps) => (
                <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="google-login-button">
                  Login with Google
                </button>
              )}
            />
          </GoogleOAuthProvider>
        </form>
      </div>
    </div>
  );
};

export default Login;
