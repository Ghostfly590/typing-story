// src/MenuPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MenuPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', backgroundColor: 'white', padding: 30, borderRadius: 8, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1>Welcome to Story App</h1>
        <p>Select your age group:</p>
        <button onClick={() => navigate('/typing')}>10 years old</button>
      </div>
    </div>
  );
};

export default MenuPage;