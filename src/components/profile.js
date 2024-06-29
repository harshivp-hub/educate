import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css';
 // Update this path

const ProfilePage = () => {
  const { userId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    phone: '',
    address: '',
    grade: '', // Add grade field
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
        const { name, email, dob, mobileNumber, grade } = response.data;
        const [firstName, lastName] = name.split(' ');
        setUser({
          firstName,
          lastName,
          email,
          dob: dob.split('T')[0],
          phone: mobileNumber,
          address: email,
          grade, // Set grade from backend response
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    try {
      await axios.put(`http://localhost:3001/api/users/${userId}`, {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        dob: user.dob,
        mobileNumber: user.phone,
        grade: user.grade, // Include grade in the PUT request
      });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const navigateToTestPage = () => {
    // eslint-disable-next-line no-undef
    navigate(`/taketest/${userId}/${grade}`);
  };

  return (
    <div className="profile-page">
      <div className="sidebar">
        <div className="logo">Padh.ai</div>
        <ul className="menu">
          <li><Link to={`/home/${userId}`}>Home</Link></li>
          <li><a href="#">Videos</a></li>
          <li><a href="#" onClick={navigateToTestPage}>Tests</a></li>
          <li className="active"><a href="#">Profile</a></li>
          <li><a href="#">Performance</a></li>
        </ul>
        <button className="logout-button">Log Out</button>
      </div>
      <div className="profile-content">
        <h1>Welcome, {user.firstName} {user.lastName}</h1>
        <div className="profile-info">
          
          <div className="profile-details">
            <div className="detail-row">
              <label>First Name:</label>
              {isEditing ? (
                <input type="text" name="firstName" value={user.firstName} onChange={handleChange} />
              ) : (
                <span>{user.firstName}</span>
              )}
            </div>
            <div className="detail-row">
              <label>Last Name:</label>
              {isEditing ? (
                <input type="text" name="lastName" value={user.lastName} onChange={handleChange} />
              ) : (
                <span>{user.lastName}</span>
              )}
            </div>
            <div className="detail-row">
              <label>Email ID:</label>
              {isEditing ? (
                <input type="email" name="email" value={user.email} onChange={handleChange} />
              ) : (
                <span>{user.email}</span>
              )}
            </div>
            <div className="detail-row">
              <label>DOB:</label>
              {isEditing ? (
                <input type="date" name="dob" value={user.dob} onChange={handleChange} />
              ) : (
                <span>{user.dob}</span>
              )}
            </div>
            <div className="detail-row">
              <label>Phone No:</label>
              {isEditing ? (
                <input type="tel" name="phone" value={user.phone} onChange={handleChange} />
              ) : (
                <span>{user.phone}</span>
              )}
            </div>
            <div className="detail-row">
              <label>Address:</label>
              {isEditing ? (
                <input type="text" name="address" value={user.address} onChange={handleChange} />
              ) : (
                <span>{user.address}</span>
              )}
            </div>
            <div className="detail-row">
              <label>Grade:</label>
              {isEditing ? (
                <input type="text" name="grade" value={user.grade} onChange={handleChange} />
              ) : (
                <span>{user.grade}</span>
              )}
            </div>
          </div>
        </div>
        <button className="edit-button" onClick={isEditing ? handleSaveClick : handleEditClick}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
