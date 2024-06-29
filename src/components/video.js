// Code to display videos by grade

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './stvideo.css';

const VideoListByGrade = () => {
  const { grade } = useParams(); // Get grade from URL params
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideosByGrade = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/videos?grade=${grade}`);
        setVideos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to fetch videos');
        setLoading(false);
      }
    };

    fetchVideosByGrade();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Videos for Grade {grade}</h2>
      <div className="video-list">
        {videos.map((video) => (
          <div key={video.videoId} className="video-item">
            <a href={`http://localhost:3001/uploads/${video.filename}`} target="_blank" rel="noopener noreferrer">
              {video.topic} - Subject: {video.subject}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoListByGrade;
