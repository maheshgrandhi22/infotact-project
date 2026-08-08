'use client';

import React, { useState, useRef } from 'react';
import DynamicRender from '@/components/DynamicRender';
import { useFrictionTracker } from '@/hooks/useFrictionTracker';

interface FormState {
  fullName: string;
  email: string;
}

interface DynamicCardProps {
  formState?: FormState;
  setFormState?: React.Dispatch<React.SetStateAction<FormState>>;
}

const ContextualDynamicCard: React.FC<DynamicCardProps> = ({ formState }) => (
  <div className="p-6 bg-slate-900 border border-indigo-500/50 rounded-xl space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-indigo-400">Context-Aware Morphing Step</h3>
      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Live Context</span>
    </div>
    <p className="text-xs text-slate-300">
      Active User: <strong className="text-indigo-200">{formState?.fullName || '(Empty)'}</strong>
    </p>
    <p className="text-xs text-slate-300">
      Email Address: <strong className="text-indigo-200">{formState?.email || '(Empty)'}</strong>
    </p>
  </div>
);

export default function Home() {
  const wsRef = useRef<WebSocket | null>(null);

  const [formState, setFormState] = useState<FormState>({
    fullName: 'mahesh',
    email: 'mahesh@gmail.com',
  });

  const [dynamicComponent, setDynamicComponent] = useState<React.ComponentType<DynamicCardProps> | null>(
    () => ContextualDynamicCard
  );

  // Activate real-time friction tracker
  useFrictionTracker({ wsRef, formState });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">AuraGen Dynamic UI System</h1>
          <p className="text-sm text-slate-400">State-aware UI morphing & friction tracking active.</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Application Form</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formState.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
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