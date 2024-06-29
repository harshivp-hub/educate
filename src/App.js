import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Registration from './components/registration';
import Login from './components/Login';
import Home from './components/home'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/register" element={<Registration />} />
          <Route path="/home" element={<Home />} />
         </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
