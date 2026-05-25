import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import stories from './stories';
import { useNavigate } from 'react-router-dom';
import './TypingPage.css';
import { saveRecord } from './statsStorage';

const TypingPage = () => {
  const [storyText, setStoryText] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [lastTypedIndex, setLastTypedIndex] = useState(null);
  const [swingToggle, setSwingToggle] = useState(false);
  const audioCtxRef = useRef(null);
  const savedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredStories = stories.filter((s) => /^s-10-/.test(s.filename));
    const selected = filteredStories.length > 0 ? filteredStories[Math.floor(Math.random() * filteredStories.length)] : stories[0];
    setStoryText(selected?.content || 'No story found.');
  }, []);

  const storyWords = useMemo(() => storyText.trim().split(/\s+/).filter(Boolean), [storyText]);
  const completedWords = useMemo(() => {
    if (!storyText || !currentInput) return 0;

    let matchLength = 0;
    while (matchLength < currentInput.length && currentInput[matchLength] === storyText[matchLength]) {
      matchLength += 1;
    }

    if (matchLength === 0) return 0;
    if (matchLength >= storyText.length) return storyWords.length;

    const prefix = storyText.slice(0, matchLength);
    if (prefix.endsWith(' ')) {
      return prefix.trim().split(/\s+/).length;
    }

    const lastSpace = prefix.lastIndexOf(' ');
    if (lastSpace === -1) return 0;
    return prefix.slice(0, lastSpace).trim().split(/\s+/).length;
  }, [currentInput, storyText, storyWords.length]);

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

      if (!startedAt && key.length === 1) {
        setStartedAt(Date.now());
      }

      if (finishedAt || !storyText) return;

      if (key === 'Backspace') {
        setCurrentInput((prev) => prev.slice(0, -1));
        setLastTypedIndex(null);
        return;
      }

      if (key.length === 1 && currentInput.length < storyText.length) {
        const expected = storyText[currentInput.length];
        const correct = key === expected;
        const nextInput = currentInput + key;

        setCurrentInput(nextInput);
        setLastTypedIndex(currentInput.length);

        if (!correct) {
          setMistakes((m) => m + 1);
          playWrong();
        } else {
          playCorrect();
          if (key === ' ' || nextInput.length === storyText.length) {
            setSwingToggle((prev) => !prev);
          }
        }

        if (nextInput === storyText) {
          setFinishedAt(Date.now());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, finishedAt, playCorrect, playWrong, startedAt, storyText]);

  const handleRestart = () => {
    setCurrentInput('');
    setMistakes(0);
    setStartedAt(null);
    setFinishedAt(null);
    setLastTypedIndex(null);
    setSwingToggle(false);
    savedRef.current = false;

    const filtered = stories.filter((s) => /^s-10-/.test(s.filename));
    const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : stories[0];
    setStoryText(selected?.content || 'No story found.');
  };

  const elapsedMs = finishedAt ? finishedAt - (startedAt || finishedAt) : (startedAt ? Date.now() - startedAt : 0);
  const elapsedSec = Math.max(0, Math.round(elapsedMs / 100) / 10); // 0.1s precision
  const displayTime = startedAt ? (finishedAt ? elapsedSec : Math.round((Date.now() - startedAt) / 100) / 10) : 0;

  useEffect(() => {
    if (!finishedAt || savedRef.current) return;
    const record = {
      startedAt: startedAt || finishedAt,
      finishedAt,
      durationMs: finishedAt - (startedAt || finishedAt),
      mistakes,
      createdAt: Date.now(),
    };
    try {
      saveRecord(record);
      savedRef.current = true;
    } catch (e) {
      // swallow storage errors
      // eslint-disable-next-line no-console
      console.error('Failed to save typing record', e);
    }
  }, [finishedAt, startedAt, mistakes]);

  return (
    <div className="typing-page-root">
      <div className="scene-panel">
        <div className="sky">
          <div className="sun" />
          <div className="cloud cloud1" />
          <div className="cloud cloud2" />
          <div className="cloud cloud3" />
        </div>
        <div className={`ground ${finishedAt ? 'cracked' : ''}`}>
          <div className={`egg ${completedWords > 0 ? 'egg-cracking' : ''} ${finishedAt ? 'egg-cracked' : ''}`}>
            <div className="egg-shell" />
            {Array.from({ length: Math.min(completedWords, 10) }, (_, index) => (
              <div key={index} className={`egg-crack crack${index}`} />
            ))}
            {finishedAt && <div className="chick">🐥</div>}
          </div>
          <div className={`person ${swingToggle ? 'swing' : ''}`}>
            {/* <div className="head" />
            <div className="body" /> */}
            <div className="axe">
              <div className="handle" />
              <div className="blade" />
            </div>
          </div>
        </div>
      </div>

      <div className="typing-card">
        <h1 className="title">Typing Adventure</h1>

        <div className="controls-row">
          <div className="status-row">
            <div className="status-box">Time: <strong>{displayTime}s</strong></div>
            <div className="status-box">Mistakes: <strong>{mistakes}</strong></div>
          </div>
          <div className="action-row">
            <button className="kid-btn" onClick={handleRestart}>Restart</button>
            <button className="kid-btn" onClick={() => navigate('/')}>Back to Menu</button>
          </div>
        </div>

        <p className="hint">Type the words below. Correct words swing the axe and crack the egg!</p>

        <div className="story-area">
          {storyText.split(/(\s+)/).map((segment, segmentIndex) => {
            const segmentStartIndex = storyText.split(/(\s+)/)
              .slice(0, segmentIndex)
              .reduce((sum, seg) => sum + seg.length, 0);

            if (segment.trim() === '') {
              return Array.from(segment).map((char, charIndex) => {
                const globalIndex = segmentStartIndex + charIndex;
                const isTyped = globalIndex < currentInput.length;
                const isCorrect = isTyped && currentInput[globalIndex] === char;
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

            return (
              <span key={`word-${segmentIndex}`} className="word-container">
                {Array.from(segment).map((char, charIndex) => {
                  const globalIndex = segmentStartIndex + charIndex;
                  const isTyped = globalIndex < currentInput.length;
                  const isCorrect = isTyped && currentInput[globalIndex] === char;
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
            <div className="celebrate">🎉 The egg is cracked! 🎉</div>
            <div className="summary">You finished in <strong>{elapsedSec}s</strong> with <strong>{mistakes}</strong> mistake{mistakes === 1 ? '' : 's'}.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingPage;
