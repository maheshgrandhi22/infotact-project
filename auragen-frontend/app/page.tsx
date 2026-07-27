'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const [cognitiveScore, setCognitiveScore] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<string>('Waiting for telemetry activity...');
  const [focusMode, setFocusMode] = useState<boolean>(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('telemetry', (data: { score?: number }) => {
      if (data && typeof data.score !== 'undefined') {
        setCognitiveScore(data.score);
      }
    });

    socket.on('ai_intervention', (data: { message?: string; action?: string }) => {
      if (data && data.message) {
        setAiSuggestion(data.message);
      }
      if (data && data.action === 'FOCUS_MODE') {
        setFocusMode(true);
      }
    });

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        setMoveCount((prev: number) => prev + 1);
        
        if (socket.connected) {
          socket.emit('telemetry_event', {
            type: 'mouse_move',
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
          });
        }
        
        throttleTimer = null;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      socket.disconnect();
    };
  }, []);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ maxWidth: '64rem', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
            AuraGen Dashboard {focusMode && <span style={{ fontSize: '0.75rem', backgroundColor: '#38bdf8', color: '#0f172a', padding: '0.125rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>FOCUS MODE ACTIVE</span>}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Real-time cognitive load and telemetry monitoring</p>
        </div>
        <div style={{ fontSize: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#94a3b8' }}>
          Status: <span style={{ color: isConnected ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: focusMode ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', transition: 'all 0.3s ease' }}>
        {/* Cognitive Score Card */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399', backgroundColor: 'rgba(6, 78, 59, 0.5)', padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid rgba(6, 78, 59, 0.8)' }}>
              Monitoring friction
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8', margin: 0 }}>Cognitive Load Score</h3>
            <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: '0.25rem 0 0 0' }}>{cognitiveScore}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Mouse actions tracked: {moveCount}</p>
          </div>
        </div>

        {/* Gemini AI Adaptive Intervention Card */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8', backgroundColor: 'rgba(3, 105, 161, 0.5)', padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid rgba(3, 105, 161, 0.8)' }}>
              Gemini Adaptation
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8', margin: 0 }}>Live AI Intervention</h3>
            <p style={{ fontSize: '1rem', fontWeight: '400', color: '#e2e8f0', margin: '0.75rem 0 0 0', lineHeight: '1.5' }}>
              {aiSuggestion}
            </p>
            {focusMode && (
              <button 
                onClick={() => setFocusMode(false)}
                style={{ marginTop: '1rem', backgroundColor: '#334155', color: '#f8fafc', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Exit Focus Mode
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}