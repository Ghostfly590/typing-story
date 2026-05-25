// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import MenuPage from './MenuPage';
import TypingPage from './TypingPage';
import ResultPage from './ResultPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/results" element={<ResultPage />} />
        <Route path="/" element={<MenuPage />} />
      </Routes>
    </Router>
  );
}

export default App;