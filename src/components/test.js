import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './test.css';

const TestPage = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [questions, setQuestions] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserName();
    fetchAvailableTests();
  }, [],[userId]);

  const fetchUserName = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      const data = await response.json();
      setUserName(data.name);
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/tests');
      const data = await response.json();
      if (!data.error) {
        setAvailableTests(data);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const handleGradeChange = (e) => {
    setGrade(e.target.value);
  };

  const uploadTest = async () => {
    const fileInput = document.getElementById('uploadTestFile');
    const file = fileInput.files[0];
    if (file && subject && grade) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          alert(`Error uploading test: ${data.error}`);
        } else {
          setQuestions(data.questions);
          await sendQuestionsToNodeAPI(data.questions);
          alert('Test uploaded successfully!');
          fetchAvailableTests();
        }
      } catch (error) {
        console.error('Error uploading test:', error);
        alert('Failed to upload test.');
      }
    } else {
      alert('Please select a file, enter a subject name, and select a grade.');
    }
  };

  const generateTest = async () => {
    const fileInput = document.getElementById('generateTestFile');
    const file = fileInput.files[0];
    if (file && subject && grade) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('http://127.0.0.1:5000/generate', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          alert(`Error generating test: ${data.error}`);
        } else {
          setMcqs(data.mcqs);
          await sendMcqsToNodeAPI(data.mcqs);
          alert('Test generated successfully!');
          fetchAvailableTests();
        }
      } catch (error) {
        console.error('Error generating test:', error);
        alert('Failed to generate test.');
      }
    } else {
      alert('Please select a file, enter a subject name, and select a grade.');
    }
  };

  const autoGenerateTest = async () => {
    if (subject && grade) {
      try {
        const response = await fetch('http://127.0.0.1:5000/auto_generate', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.error) {
          alert(`Error auto-generating test: ${data.error}`);
        } else {
          setMcqs(data.mcqs);
          await sendMcqsToNodeAPI(data.mcqs);
          alert('Test auto-generated successfully!');
          fetchAvailableTests();
        }
      } catch (error) {
        console.error('Error auto-generating test:', error);
        alert('Failed to auto-generate test.');
      }
    } else {
      alert('Please enter a subject name and select a grade.');
    }
  };

  const sendQuestionsToNodeAPI = async (questions) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, grade, questions }),
      });
      const data = await response.json();
      if (data.error) {
        alert(`Error sending questions to Node API: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending questions to Node API:', error);
    }
  };

  const sendMcqsToNodeAPI = async (mcqs) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/mcqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, grade, mcqs }),
      });
      const data = await response.json();
      if (data.error) {
        alert(`Error sending MCQs to Node API: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending MCQs to Node API:', error);
    }
  };

  const handleTakeTest = (subject) => {
    navigate(`/taketest/${subject}`);
  };

  return (
    <div className="test-page-container">
      <div className="test-page-sidebar">
        <h1 className="test-page-logo">Padh.ai</h1>
        <ul className="menu">
          <li className="home"><a href="/teacherhome/:userId">Home</a></li>
          <li><a href="/addvideos/:userId">Add Videos</a></li>
          <li className="active"><a>Give Tests</a></li>
          <li><Link to={`/profile/${userId}`}>Profile</Link></li>
          <li><a href="leaderboards">Class Performance</a></li>
        </ul>
        <a href="/" className="test-page-logout">Log Out</a>
      </div>
      <div className="test-page-main-content">
        <div className="test-page-header">
          <h2>Welcome, {userName}</h2>
        </div>
        <div className="test-page-content">
          <div className="test-page-subject">
            <h3>Enter Subject Name and Grade</h3>
            <input 
              type="text" 
              value={subject} 
              onChange={handleSubjectChange} 
              placeholder="Enter subject name" 
            />
            <select value={grade} onChange={handleGradeChange}>
              <option value="">Select Grade</option>
              {[...Array(12).keys()].map(i => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div className="test-page-upload-test">
            <h3>Upload Test</h3>
            <input type="file" id="uploadTestFile" />
            <button onClick={uploadTest}>Upload</button>
          </div>
          
        </div>
        <div className="test-page-available-tests">
          <h3>Available Tests</h3>
          <ul>
            {availableTests.map((test, index) => (
              <li key={index}>
                <strong>{test.subject} (Grade: {test.grade})</strong>
                <button onClick={() => handleTakeTest(test.subject)}>Take Test</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
