import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Registration from './components/registration';
import Login from './components/Login';
import Home from './components/home'
import TeacherHome from './components/teacherhome';
import VideoUpload from './components/addvideos';
import TestPage from './components/test';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/register" element={<Registration />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/teacherhome" element={<TeacherHome />} />
          <Route path="/addvideos" element={<VideoUpload />} />
         </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
