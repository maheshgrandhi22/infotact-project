'use client';

import React, { useState, useEffect, useRef } from 'react';

// Web Audio API helper for instant click sound without external assets
const playClickSound = () => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;

    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Crisp high-frequency snap
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);

    // Fast volume decay envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    // Suppress browser autoplay restrictions if triggered prior to user interaction
  }
};

export default function Home() {
  const [telemetry, setTelemetry] = useState({
    mouseX: 0,
    mouseY: 0,
    clicks: 0,
    idleTime: 0,
    velocity: 0.0,
    cognitiveLoadScore: 20,
  });

  const lastPos = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    // 1. Track mouse position & velocity
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = (now - lastPos.current.time) / 1000;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const currentVelocity = dt > 0 ? distance / dt / 100 : 0;

      lastPos.current = { x: e.clientX, y: e.clientY, time: now };

      setTelemetry((prev) => ({
        ...prev,
        mouseX: e.clientX,
        mouseY: e.clientY,
        velocity: parseFloat(currentVelocity.toFixed(2)),
        idleTime: 0,
      }));
    };

    // 2. Play sound & increment clicks on every mouse click
    const handleGlobalClick = () => {
      playClickSound();

      setTelemetry((prev) => ({
        ...prev,
        clicks: prev.clicks + 1,
      }));
    };

    // 3. Track idle seconds
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        idleTime: prev.idleTime + 1,
      }));
    }, 1000);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGlobalClick);
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#070d19] text-white p-8 relative overflow-hidden font-sans">
      {/* Floating Telemetry Panel View */}
      <div className="fixed top-6 left-6 z-50">
        <div className="w-60 p-4 bg-[#0e1726]/85 backdrop-blur-md border border-[#1e293b] rounded-xl shadow-2xl select-none">
          <h3 className="text-sm font-semibold text-[#00f2fe] mb-3">
            Telemetry Panel
          </h3>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>Mouse X :</span>
              <span className="text-slate-100">{telemetry.mouseX}</span>
            </div>
            <div className="flex justify-between">
              <span>Mouse Y :</span>
              <span className="text-slate-100">{telemetry.mouseY}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Clicks :</span>
              <span className="text-slate-100">{telemetry.clicks}</span>
            </div>
            <div className="flex justify-between">
              <span>Idle Time :</span>
              <span className="text-slate-100">{telemetry.idleTime} sec</span>
            </div>
            <div className="flex justify-between">
              <span>Velocity :</span>
              <span className="text-slate-100">{telemetry.velocity.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-[#132238] border border-[#1e293b] rounded-lg text-xs flex items-center gap-2">
            <span>🧠</span>
            <span className="text-slate-200">
              Cognitive Load Score :{telemetry.cognitiveLoadScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Page Layout Container */}
      <div className="max-w-4xl mx-auto pt-20 text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          AuraGen Interactive Canvas
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Click anywhere on the screen to hear the feedback audio and watch real-time telemetry stats update live.
        </p>
      </div>
    </main>
  );
}