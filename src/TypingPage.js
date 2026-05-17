import React, { useCallback, useEffect, useRef, useState } from 'react';
import stories from './stories';
import { useNavigate } from 'react-router-dom';
import './TypingPage.css';

const TypingPage = () => {
  const [storyText, setStoryText] = useState('');
  const [input, setInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [lastTypedIndex, setLastTypedIndex] = useState(null);
  const audioCtxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredStories = stories.filter((s) => /^s-10-/.test(s.filename));
    const selected = filteredStories.length > 0 ? filteredStories[Math.floor(Math.random() * filteredStories.length)] : stories[0];
    setStoryText(selected?.content || 'No story found.');
  }, []);

  // Audio helpers (generate simple tones so we don't need assets)
  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, duration = 0.12) => {
    const ctx = ensureAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    o.stop(ctx.currentTime + duration + 0.02);
  }, [ensureAudio]);

  const playCorrect = useCallback(() => playTone(880, 0.12), [playTone]);
  const playWrong = useCallback(() => playTone(220, 0.18), [playTone]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      // Start timer on first real key
      if (!startedAt && key.length === 1) setStartedAt(Date.now());

      if (finishedAt) return; // ignore after finish

      if (key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
        setLastTypedIndex(null);
        return;
      }

      if (key.length === 1 && input.length < storyText.length) {
        const expected = storyText[input.length];
        const correct = key === expected;
        setInput((prev) => prev + key);
        setLastTypedIndex(input.length);
        if (!correct) {
          setMistakes((m) => m + 1);
          playWrong();
        } else {
          playCorrect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, storyText, startedAt, finishedAt, playCorrect, playWrong]);

  // detect finish
  useEffect(() => {
    if (storyText && input === storyText && !finishedAt && storyText.length > 0) {
      setFinishedAt(Date.now());
    }
  }, [input, storyText, finishedAt]);

  const handleRestart = () => {
    setInput('');
    setMistakes(0);
    setStartedAt(null);
    setFinishedAt(null);
    setLastTypedIndex(null);
    // reselect a story
    const filtered = stories.filter((s) => /^s-10-/.test(s.filename));
    const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : stories[0];
    setStoryText(selected?.content || 'No story found.');
  };

  const elapsedMs = finishedAt ? finishedAt - (startedAt || finishedAt) : (startedAt ? Date.now() - startedAt : 0);
  const elapsedSec = Math.max(0, Math.round(elapsedMs / 100) / 10); // 0.1s precision

  return (
    <div className="typing-page-root">
      <div className="typing-card">
        <h1 className="title">Typing Adventure</h1>

        <div className="controls-row">
          <div className="status-row">
            <div className="status-box">Time: <strong>{(startedAt ? (finishedAt ? elapsedSec : Math.round((Date.now() - startedAt)/100)/10) : 0)}s</strong></div>
            <div className="status-box">Mistakes: <strong>{mistakes}</strong></div>
          </div>
          <div className="action-row">
            <button className="kid-btn" onClick={handleRestart}>Restart</button>
            <button className="kid-btn" onClick={() => navigate('/')}>Back to Menu</button>
          </div>
        </div>

        <p className="hint">Type the story below — have fun! Backspace fixes mistakes.</p>

        <div className="story-area">
          {storyText.split(/(\s+)/).map((segment, wordIndex) => {
            // Determine the starting global index of this specific word/space segment
            const segmentStartIndex = storyText.split(/(\s+)/)
                .slice(0, wordIndex)
                .reduce((sum, seg) => sum + seg.length, 0);

            // If the segment is whitespace, render it normally
            if (segment.trim() === '') {
                return Array.from(segment).map((char, charIndex) => {
                const globalIndex = segmentStartIndex + charIndex;
                const isTyped = globalIndex < input.length;
                const isCorrect = isTyped && input[globalIndex] === char;
                const isLast = globalIndex === lastTypedIndex;
                
                const classes = ['char'];
                if (isTyped) classes.push(isCorrect ? 'char-correct' : 'char-wrong');
                if (isLast && lastTypedIndex !== null) classes.push('char-flash');

                return (
                    <span key={`space-${globalIndex}`} className={classes.join(' ')}>
                    {'\u00A0'}
                    </span>
                );
                });
            }

            // If the segment is a word, wrap its character spans in a word container
            return (
                <span key={`word-${wordIndex}`} className="word-container">
                {Array.from(segment).map((char, charIndex) => {
                    const globalIndex = segmentStartIndex + charIndex;
                    const isTyped = globalIndex < input.length;
                    const isCorrect = isTyped && input[globalIndex] === char;
                    const isLast = globalIndex === lastTypedIndex;
                    
                    const classes = ['char'];
                    if (isTyped) classes.push(isCorrect ? 'char-correct' : 'char-wrong');
                    if (isLast && lastTypedIndex !== null) classes.push('char-flash');

                    return (
                    <span key={`char-${globalIndex}`} className={classes.join(' ')}>
                        {char}
                    </span>
                    );
                })}
                </span>
            );
            })}
        </div>

        {finishedAt && (
          <div className="finished">
            <div className="celebrate">🎉 Well done! 🎉</div>
            <div className="summary">You finished in <strong>{elapsedSec}s</strong> with <strong>{mistakes}</strong> mistake{mistakes === 1 ? '' : 's'}.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingPage;
