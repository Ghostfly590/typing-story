// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import MenuPage from './MenuPage';
import TypingPage from './TypingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/" element={<MenuPage />} />
      </Routes>
    </Router>
  );
}

export default App;