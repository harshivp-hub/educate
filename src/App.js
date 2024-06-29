import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Registration from './components/registration';
import Login from './components/Login';
import Home from './components/home'
import TeacherHome from './components/teacherhome';
import VideoUpload from './components/addvideos';
import TestPage from './components/test';
import Test from './components/taketest';
import ProfilePage from './components/profile';
import TakeTestPage from './components/testpage';
import VideoListByGrade from './components/video';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/home/:userId" element={<Home />} />
          <Route path="/test/:userId" element={<TestPage />} />
          <Route path="/teacherhome/:userId" element={<TeacherHome />} />
          <Route path="/addvideos/:userId" element={<VideoUpload />} />
          <Route path="/taketest/:userId/:grade" element={<Test />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/testpage/:testId" element={<TakeTestPage />} />
          <Route path="/videos/:grade" element={<VideoListByGrade />} />


         </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
