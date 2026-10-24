
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

function ContextualDynamicCard({ formState }: DynamicCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-300">
          ◈
        </div>
        <div>
          <h3 className="font-semibold text-white">Context awareness</h3>
          <p className="text-xs text-slate-500">Live application context</p>
        </div>
        <span className="ml-auto rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
          Active
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-slate-950/50 p-3">
          <p className="mb-1 text-xs text-slate-500">Current user</p>
          <p className="truncate text-sm font-medium text-slate-200">
            {formState?.fullName || 'Not provided'}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-slate-950/50 p-3">
          <p className="mb-1 text-xs text-slate-500">Email address</p>
          <p className="truncate text-sm font-medium text-slate-200">
            {formState?.email || 'Not provided'}
          </p>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        AuraGen uses the current form state to provide contextual assistance
        when interaction friction is detected.
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">
        {eyebrow}
      </p>
      <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    fullName: 'mahesh',
    email: 'mahesh@gmail.com',
  });

  const [dynamicComponent, setDynamicComponent] =
    useState<React.ComponentType<DynamicCardProps> | null>(
      () => ContextualDynamicCard
    );

  const [lastActivity, setLastActivity] = useState('Waiting for activity');

  const [telemetry, setTelemetry] = useState({
    mouseX: 0,
    mouseY: 0,
    clicks: 0,
    idleTime: 0,
    velocity: 0,
    cognitiveLoadScore: 20,
  });

  const lastPos = useRef({
    x: 0,
    y: 0,
    time: Date.now(),
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      const dt = (now - lastPos.current.time) / 1000;
      const dx = event.clientX - lastPos.current.x;
      const dy = event.clientY - lastPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = dt > 0 ? distance / dt / 100 : 0;

      lastPos.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
      };

      setTelemetry((previous) => ({
        ...previous,
        mouseX: event.clientX,
        mouseY: event.clientY,
        velocity: Number(velocity.toFixed(2)),
        idleTime: 0,
      }));
    };

    const handleClick = () => {
      setTelemetry((previous) => ({
        ...previous,
        clicks: previous.clicks + 1,
      }));
      setLastActivity('User interaction detected');
    };

    const interval = window.setInterval(() => {
      setTelemetry((previous) => ({
        ...previous,
        idleTime: previous.idleTime + 1,
      }));
    }, 1000);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.clearInterval(interval);
    };
  }, []);

  const handleWSMessage = useCallback((data: any) => {
    if (
      (data.type === 'COMPONENT_GENERATED' ||
        data.type === 'CODE_STREAM_CHUNK') &&
      data.code
    ) {
      try {
        const CompiledComponent = compileJSX(data.code);
        setDynamicComponent(() => CompiledComponent);
        setLastActivity('AI assistance updated');
      } catch {
        console.warn(
          '[AuraGen] Dynamic component compilation failed or is incomplete.'
        );
        setLastActivity('Waiting for a complete AI response');
      }
    } else if (data.type === 'ERROR') {
      setLastActivity('Request could not be completed');
    }
  }, []);

  const { wsRef, isConnected } = useWebSocket(
    'ws://127.0.0.1:8080',
    handleWSMessage
  );

  useFrictionTracker({ wsRef, formState });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormState((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b16] text-slate-100">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/[0.12] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.08] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-48 left-1/3 h-96 w-96 rounded-full bg-blue-600/[0.07] blur-[120px]"
      />

      <div className="relative z-10 mx-auto min-h-screen max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-950/40">
              <span className="text-xl font-black text-white">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                AuraGen
                <span className="ml-2 font-medium text-slate-500">
                  Studio
                </span>
              </h1>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Adaptive AI experience platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:block">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Environment
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-300">
                Local development
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 ${
                isConnected
                  ? 'border-cyan-400/20 bg-cyan-400/[0.07]'
                  : 'border-rose-400/20 bg-rose-400/[0.07]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected
                    ? 'animate-pulse bg-cyan-300'
                    : 'bg-rose-400'
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  isConnected ? 'text-cyan-200' : 'text-rose-300'
                }`}
              >
                {isConnected ? 'WS Live' : 'WS Offline'}
              </span>
            </div>
          </div>
        </header>

        {/* Intro */}
        <section className="py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                Intelligent interface
              </div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Interfaces that
                <br className="hidden sm:block" />{' '}
                <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  adapt to you.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Experience state-aware UI, real-time friction detection,
                and contextual AI assistance in one intelligent workspace.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 md:min-w-56">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.08] text-lg text-cyan-300">
                ✳
              </div>
              <div>
                <p className="text-xs text-slate-500">System status</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {isConnected ? 'Ready for interaction' : 'Connecting…'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section
          aria-label="Session overview"
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/[0.07] bg-[#101525]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Connection</p>
              <span className="text-lg text-cyan-300">⌁</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-white">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              WebSocket · Port 8080
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101525]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">User interactions</p>
              <span className="text-lg text-violet-300">⌘</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-white">
              {telemetry.clicks}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clicks in this session
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101525]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Last activity</p>
              <span className="text-lg text-cyan-300">◷</span>
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-white">
              {lastActivity}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Updated during this session
            </p>
          </div>
        </section>

        {/* Main workspace */}
        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Application form */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101525]/90 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <SectionHeading
                eyebrow="Workspace / 01"
                title="Application details"
                description="Enter your details and explore the adaptive interface."
              />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                Your form state is tracked as you interact
              </div>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-xs font-medium text-slate-300"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  value={formState.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-white/10 bg-[#090e1c] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-violet-400/30 focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10"
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  This value stays synchronized with the current form state.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#090e1c] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div className="rounded-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.08] to-cyan-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-200">
                    ✧
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Adaptive experience enabled
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Rapid repeated clicks can trigger contextual
                      assistance. Your current form values are passed along
                      with the friction event.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-xs text-slate-500">
                  Demo workspace
                </span>
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                  State synchronized
                </span>
              </div>
            </div>
          </div>

          {/* AI assistance */}
          <div className="overflow-hidden rounded-2xl border border-violet-400/15 bg-[#101525]/90 shadow-2xl shadow-violet-950/10 backdrop-blur-xl">
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <SectionHeading
                eyebrow="Workspace / 02"
                title="AI copilot"
                description="Contextual guidance that responds to interaction friction."
              />

              <div className="flex items-center gap-3 rounded-xl border border-violet-400/15 bg-violet-400/[0.06] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 text-xl text-violet-200">
                  ✧
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    AuraGen assistant
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isConnected
                      ? 'Connected to your local AI backend'
                      : 'Waiting for backend connection'}
                  </p>
                </div>
                <span
                  className={`ml-auto h-2 w-2 shrink-0 rounded-full ${
                    isConnected ? 'bg-cyan-300' : 'bg-rose-400'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="rounded-xl border border-white/[0.06] bg-[#090e1c]/70 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Current context
                </p>
                <p className="text-sm text-slate-300">
                  {formState.fullName
                    ? `Working with ${formState.fullName}'s application`
                    : 'Waiting for application details'}
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {formState.email || 'No email provided'}
                </p>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Assistance panel
                  </h3>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-400">
                    Dynamic UI
                  </span>
                </div>

                <DynamicRender
                  wsRef={wsRef}
                  component={dynamicComponent || undefined}
                  componentProps={{ formState, setFormState }}
                />
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <p className="text-xs text-slate-400">
                    {isConnected
                      ? 'Real-time channel is available'
                      : 'Reconnect the backend to enable live assistance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Telemetry */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101525]/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300">
                ◉
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Interaction telemetry
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Live browser interaction metrics
                </p>
              </div>
            </div>

            <span className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Live metrics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Mouse X', value: telemetry.mouseX.toString(), unit: 'px' },
              { label: 'Mouse Y', value: telemetry.mouseY.toString(), unit: 'px' },
              { label: 'Total clicks', value: telemetry.clicks.toString(), unit: 'events' },
              { label: 'Idle time', value: telemetry.idleTime.toString(), unit: 'sec' },
              { label: 'Pointer velocity', value: telemetry.velocity.toFixed(2), unit: 'scaled' },
              {
                label: 'Cognitive score',
                value: telemetry.cognitiveLoadScore.toString(),
                unit: 'demo value',
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="min-w-0 bg-[#101525] px-4 py-4 sm:px-5"
              >
                <p className="truncate text-[11px] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 truncate font-mono text-xl font-semibold text-slate-100">
                  {metric.value}
                </p>
                <p className="mt-1 text-[10px] text-slate-600">
                  {metric.unit}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-5 py-3 text-[10px] text-slate-500 sm:px-6">
            <span>AuraGen · Adaptive UI monitoring</span>
            <span>Metrics are local to this browser session</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-2 py-7 text-[11px] text-slate-600">
          <p>AuraGen Studio · State-aware interface demo</p>
          <p>Built for adaptive digital experiences</p>
        </footer>
      </div>
    </main>
  );
}
