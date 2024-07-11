import React, { useState } from 'react';
import './Timetable.css';

const Timetable = () => {
  const [view, setView] = useState('weekly');
  const [selectedClass, setSelectedClass] = useState('');
  
  const handleViewChange = (viewType) => {
    setView(viewType);
  };

  return (
    <div className="timetable-container">
      <div className="sidebar">
        <div className="logo">Padh.ai</div>
        <div className="menu">
          <a href="/teacherhome">Home</a>
          <a href="/timetable" className="active">Timetable</a>
          <a href="/tests">Tests</a>
          <a href="/profile">Profile</a>
          <a href="/performance">Performance</a>
        </div>
        <div className="logout">
          <a href="/logout">Log Out</a>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <span>Welcome, ABC XYZ</span>
        </div>
        <div className="calendar-section">
          <div className="calendar-header">
            <select 
              className="class-select" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option>Select Class</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-toggle-button ${view === 'weekly' ? 'active' : ''}`} 
                onClick={() => handleViewChange('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`view-toggle-button ${view === 'daily' ? 'active' : ''}`} 
                onClick={() => handleViewChange('daily')}
              >
                Daily
              </button>
            </div>
          </div>
          {view === 'weekly' ? (
            <WeeklyView />
          ) : (
            <DailyView />
          )}
          <div className="actions">
            <button className="apply-leave">Apply Leave</button>
            <button className="apply-proxy">Apply Proxy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklyView = () => {
  return (
    <table className="calendar-table">
      <thead>
        <tr>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thursday</th>
          <th>Friday</th>
          <th>Saturday</th>
        </tr>
      </thead>
      <tbody>
        {Array(8).fill(0).map((_, index) => (
          <tr key={index}>
            {Array(6).fill(0).map((_, idx) => (
              <td key={idx} className={index % 2 === 0 ? 'gray' : ''}></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DailyView = () => {
  const hours = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00',
    '04:00 - 05:00'
  ];

  return (
    <table className="calendar-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Subject</th>
        </tr>
      </thead>
      <tbody>
        {hours.map((hour, index) => (
          <tr key={index}>
            <td>{hour}</td>
            <td className={index % 2 === 0 ? 'gray' : ''}></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Timetable;
