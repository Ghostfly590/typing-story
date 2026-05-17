// src/TypingPage.js
import React, { useEffect, useState } from 'react';
import stories from './stories';

const TypingPage = () => {
  const [storyText, setStoryText] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    const filteredStories = stories.filter((story) => /^s-10-/.test(story.filename));
    const selectedStory = filteredStories.length > 0 ? filteredStories[Math.floor(Math.random() * filteredStories.length)] : stories[0];
    setStoryText(selectedStory?.content || 'No story found.');
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (key.length === 1 && input.length < storyText.length) {
        setInput((prev) => prev + key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input.length, storyText.length]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div
        style={{
          textAlign: 'left',
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 800,
        }}
      >
        <h1>Typing Game</h1>
        <p style={{ marginBottom: 16 }}>
          Type the story below using your keyboard. Backspace works to correct mistakes.
        </p>

        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            fontSize: '1.1rem',
            color: '#000',
          }}
        >
          {Array.from(storyText).map((char, index) => {
            const isTyped = index < input.length;
            const isCorrect = isTyped && input[index] === char;
            return (
              <span key={index} style={{ color: isTyped ? (isCorrect ? 'green' : 'red') : 'black' }}>
                {char}
              </span>
            );
          })}
        </div>

        <div style={{ marginTop: 24, fontSize: '0.95rem', color: '#555' }}>
          <strong>Typed so far:</strong> <code>{input}</code>
        </div>
      </div>
    </div>
  );
};

export default TypingPage;