import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecordsSorted, clearRecords } from './statsStorage';

const ResultPage = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecords(getRecordsSorted());
  }, []);

  const handleClear = () => {
    clearRecords();
    setRecords([]);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Typing Results</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate('/')}>Back to Menu</button>
        <button onClick={handleClear} style={{ marginLeft: 8 }}>Clear All</button>
      </div>

      {records.length === 0 ? (
        <div>No records found for the last 2 weeks.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Start</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Finish</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Duration (s)</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Mistakes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{new Date(r.startedAt || r.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{new Date(r.finishedAt || r.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{(((r.finishedAt || r.createdAt) - (r.startedAt || r.finishedAt || r.createdAt)) / 1000).toFixed(1)}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{r.mistakes ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
