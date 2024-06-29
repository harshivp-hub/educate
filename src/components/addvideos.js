import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './VideoUpload.css';

const VideoUpload = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const videoResponse = await axios.get('http://localhost:3001/api/videos');
      const videoData = videoResponse.data;
      setVideos(videoData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`http://localhost:3001/api/users/${userId}`);
        const userData = await userResponse.json();
        setUserName(userData.name);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
    fetchVideos(); // Initial fetch of videos

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTopicChange = (event) => {
    setTopic(event.target.value);
  };

  const handleGradeChange = (event) => {
    setGrade(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !topic || !grade || !subject) {
      setMessage('Please fill out all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('topic', topic);
    formData.append('grade', grade);
    formData.append('subject', subject);

    try {
      const response = await axios.post('http://localhost:3001/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('File uploaded successfully.');
        fetchVideos(); // Refresh video list after upload
        setSelectedFile(null);
        setTopic('');
        setGrade('');
        setSubject('');
      } else {
        setMessage('Error uploading file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    }
  };

  const navigateToTestPage = () => {
    navigate(`/test`);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <h1>Padh.ai</h1>
        </div>
        <ul className="menu">
          <li><Link to={`/teacherhome`}>Home</Link></li>
          <li className="active"><Link to={`/addvideos/${userId}`}>Add Videos</Link></li>
          <li><a href="#" onClick={navigateToTestPage}>Give Tests</a></li>
          <li><Link to={`/profile/${userId}`}>Profile</Link></li>
          <li><Link to={`/studentli/${userId}`}>Class Performance</Link></li>
        </ul>
        <div className="logout">
          <a href="#">Log Out</a>
        </div>
      </div>
      <div className="main-content">
        <header>
          <span>Welcome, {userName}</span>
        </header>
        <div className="content">
          <div className="upload-container">
            <div className="upload-section">
              <h2>Upload video</h2>
              <input type="file" onChange={handleFileChange} className="file-input" />
              <input type="text" placeholder="Topic" value={topic} onChange={handleTopicChange} />
              <input type="text" placeholder="Grade" value={grade} onChange={handleGradeChange} />
              <input type="text" placeholder="Subject" value={subject} onChange={handleSubjectChange} />
              <button onClick={handleUpload} className="upload-button">Upload</button>
              {message && <p className="message">{message}</p>}
            </div>
            <div className="existing-videos">
              <h2>Existing videos</h2>
              <div className="video-list">
                {videos.map((video) => (
                  <div key={video.videoId} className="video-item">
                    <a href={`http://localhost:3001/uploads/${video.filename}`} target="_blank" rel="noopener noreferrer">
                      {video.topic} - Grade: {video.grade} - Subject: {video.subject}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
