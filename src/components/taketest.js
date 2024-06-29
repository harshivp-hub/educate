import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './taketest.css';

const TakeTest = () => {
  const navigate = useNavigate(); // Hook to get navigation function
  const { userId, grade } = useParams();
  const [userName, setUserName] = useState('');
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserName();
  }, [userId]);

  useEffect(() => {
    if (grade) {
      fetchAvailableTests();
    }
  }, [grade]);

  const fetchUserName = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUserName(data.name);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tests?grade=${grade}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available tests');
      }
      const data = await response.json();
      setAvailableTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Failed to fetch available tests');
    }
  };

  const handleTakeTest = (_id) => {
    // Navigate to the test page for the selected test
    navigate(`/testpage/${_id}`);
  };

  if (loading) {
    return <div className="taketest-page-container">Loading...</div>;
  }

  if (error) {
    return <div className="taketest-page-container">Error: {error}</div>;
  }

  return (
    <div className="taketest-page-container">
      <div className="taketest-page-sidebar">
        <h1 className="taketest-page-logo">Padh.ai</h1>
        <ul className="menu">
          <li className="home"><Link to={`/home/${userId}`}>Home</Link></li>
          <li><a href="#">Videos</a></li>
          <li className="active"><a>Take Tests</a></li>
          <li><Link to={`/profile/${userId}`}>Profile</Link></li>
          <li><Link to={`/leaderboards/${userId}`}>Leaderboards</Link></li>
        </ul>
        <Link to="/" className="taketest-page-logout">Log Out</Link>
      </div>
      <div className="taketest-page-main-content">
        <div className="taketest-page-header">
          <h2>Welcome, {userName}</h2>
        </div>
        <div className="taketest-page-content">
          <div className="taketest-page-available-tests">
            <h3>Available Tests for Grade {grade}</h3>
            <ul>
              {availableTests.map((test, index) => (
                <li key={index}>
                  <strong>{test.subject} (Test ID: {test._id})</strong>
                  <button onClick={() => handleTakeTest(test._id)}>Take Test</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
