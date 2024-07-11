import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './registration.css';

const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [grade, setGrade] = useState('');
  const [role, setRole] = useState('student'); // Default role is student
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/users/register', {
        name,
        email,
        password,
        mobileNumber,
        dob,
        grade: role === 'student' ? grade : '', // Set grade only if role is student
        role // Include role in the registration data
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="black-section">
        <h1>Padh.<span style={{ fontWeight: "normal" }}>ai</span></h1>
        <p>Teachers are meant to teach</p>
      </div>
      <div className="white-section">
        <p>Welcome,<br />Please register to access your portal</p>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="input-container">
            <label>Role:</label><br />
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div className="input-container">
            <label htmlFor="name">Name:</label><br />
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="mobileNumber">Mobile Number:</label><br />
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              required
            />
          </div>
          {role === 'student' && (
            <div className="input-container">
              <label htmlFor="grade">Grade:</label><br />
              <input
                type="text"
                id="grade"
                name="grade"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-container">
            <label htmlFor="dob">Date of Birth:</label><br />
            <input
              type="date"
              id="dob"
              name="dob"
              value={dob}
              onChange={e => setDob(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="email">Email ID:</label><br />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
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
              required
            />
          </div>
          
          <Link to="/" className="login-user">Login User</Link>
          <button type="submit" className="register-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
