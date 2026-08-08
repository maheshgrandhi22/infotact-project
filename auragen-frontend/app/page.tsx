'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DynamicRender from '@/components/DynamicRender';
import { useFrictionTracker } from '@/hooks/useFrictionTracker';
import { useWebSocket } from '@/hooks/useWebSocket';
import { compileJSX } from '@/utils/compileJSX';

interface FormState {
  fullName: string;
  email: string;
}

interface DynamicCardProps {
  formState?: FormState;
  setFormState?: React.Dispatch<React.SetStateAction<FormState>>;
}

const ContextualDynamicCard: React.FC<DynamicCardProps> = ({ formState }) => (
  <div className="p-6 bg-cyan-950/30 border border-cyan-500/30 rounded-xl space-y-3 backdrop-blur-md shadow-lg shadow-cyan-950/50">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-cyan-400">Context-Aware Morphing Step</h3>
      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Live Context</span>
    </div>
    <p className="text-xs text-cyan-100/80">
      Active User: <strong className="text-cyan-200">{formState?.fullName || '(Empty)'}</strong>
    </p>
    <p className="text-xs text-cyan-100/80">
      Email Address: <strong className="text-cyan-200">{formState?.email || '(Empty)'}</strong>
    </p>
  </div>
);

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    fullName: 'mahesh',
    email: 'mahesh@gmail.com',
  });

  const [dynamicComponent, setDynamicComponent] = useState<React.ComponentType<DynamicCardProps> | null>(
    () => ContextualDynamicCard
  );

  // Telemetry metrics tracking state
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
    // Track mouse coordinates and velocity
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

    // Global click handler for tracking click counter without sound
    const handleGlobalClick = () => {
      setTelemetry((prev) => ({
        ...prev,
        clicks: prev.clicks + 1,
      }));
    };

    // Idle timer interval
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

  const handleWSMessage = useCallback((data: any) => {
    if ((data.type === 'COMPONENT_GENERATED' || data.type === 'CODE_STREAM_CHUNK') && data.code) {
      try {
        const CompiledComponent = compileJSX(data.code);
        setDynamicComponent(() => CompiledComponent);
      } catch (err) {
        console.warn('[AuraGen] Partial code chunk compile pending full structure.');
      }
    }
  }, []);

  const { wsRef, isConnected } = useWebSocket('ws://127.0.0.1:8080', handleWSMessage);

  useFrictionTracker({ wsRef, formState });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-cyan-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Telemetry Panel Overlay */}
      <div className="fixed top-6 right-6 z-50">
        <div className="w-64 p-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/50 select-none">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Telemetry Panel
            </h3>
            <span className="text-[10px] text-cyan-500/70 font-mono">LIVE</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Mouse X:</span>
              <span className="text-cyan-200 font-semibold">{telemetry.mouseX}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Mouse Y:</span>
              <span className="text-cyan-200 font-semibold">{telemetry.mouseY}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Clicks:</span>
              <span className="text-cyan-200 font-semibold">{telemetry.clicks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Idle Time:</span>
              <span className="text-cyan-200 font-semibold">{telemetry.idleTime} sec</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Velocity:</span>
              <span className="text-cyan-200 font-semibold">{telemetry.velocity.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-xs flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span>🧠</span> Cognitive Load:
            </span>
            <span className="text-cyan-300 font-bold font-mono">
              {telemetry.cognitiveLoadScore}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">AuraGen Dynamic UI System</h1>
            <p className="text-sm text-cyan-200/60">State-aware UI morphing & friction tracking active.</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-cyan-500/20 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md shadow-cyan-950/30">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-cyan-200/80 font-mono">
              {isConnected ? 'WS Live' : 'WS Offline'}
            </span>
          </div>
        </div>

        <div className="p-6 bg-slate-900/80 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-950/30 space-y-4">
          <h2 className="text-lg font-semibold text-cyan-100">Application Form</h2>

          <div>
            <label className="block text-xs text-cyan-200/60 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formState.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full bg-slate-950/60 border border-cyan-500/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-100 placeholder-cyan-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-cyan-200/60 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full bg-slate-950/60 border border-cyan-500/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-100 placeholder-cyan-700 transition-colors"
            />
          </div>
        </div>

        <DynamicRender
          wsRef={wsRef}
          component={dynamicComponent || undefined}
          componentProps={{ formState, setFormState }}
        />
      </div>
    </main>
  );
}