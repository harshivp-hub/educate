import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './home.css';

const TeacherHome = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', dueDate: '', status: '', userId });
  const [newSchedule, setNewSchedule] = useState({ time: '', class: '', userId });
  const navigate = useNavigate();

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

    const fetchTasks = async () => {
      try {
        const tasksResponse = await fetch(`http://localhost:3001/api/tasks?userId=${userId}`);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    const fetchSchedule = async () => {
      try {
        const scheduleResponse = await fetch(`http://localhost:3001/api/schedule?userId=${userId}`);
        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchUserData();
    fetchTasks();
    fetchSchedule();
  }, [userId]);

  const handleAddTask = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await response.json();
      setTasks([...tasks, data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
      const data = await response.json();
      setSchedule([...schedule, data]);
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const navigateToTestPage = () => {
    navigate(`/test/${userId}`);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <h1>Padh.ai</h1>
        </div>
        <ul className="menu">
          <li className="active"><a href="#">Home</a></li>
          <li><Link to={`/addvideos/${userId}`}>Add Videos</Link></li>
          <li><a href="#" onClick={navigateToTestPage}>Give Tests</a></li>
          <li><Link to={`/profile/${userId}`}>Profile</Link></li>
          <li><Link to={`/leaderboards/${userId}`}>Class Performance</Link></li>
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
          <div className="quick-links">
            <h2>Quick Links</h2>
            <div className="links">
              <button>Class Summary</button>
              <button><Link to={`/addvideos/${userId}`}>Add Videos</Link></button>
              <button><Link to={`/findstudent/${userId}`}>Find Student</Link></button>
              <button><Link to={`/create-task/${userId}`}>Create Task</Link></button>
              <button><Link to={`/profile/${userId}`}>Profile</Link></button>
            </div>
          </div>
          <div className="schedule">
            <h2>Today's Schedule</h2>
            <ul>
              {schedule.map((item, index) => (
                <li key={index}>{item.time} - {item.class}</li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Time"
              value={newSchedule.time}
              onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Class"
              value={newSchedule.class}
              onChange={e => setNewSchedule({ ...newSchedule, class: e.target.value })}
            />
            <button onClick={handleAddSchedule}>Add Schedule</button>
          </div>
          <div className="tasks">
            <h2>Task's Due</h2>
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td>{task.name}</td>
                    <td>{task.dueDate}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.name}
              onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Due Date"
              value={newTask.dueDate}
              onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Status"
              value={newTask.status}
              onChange={e => setNewTask({ ...newTask, status: e.target.value })}
            />
            <button onClick={handleAddTask}>Add Task</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
