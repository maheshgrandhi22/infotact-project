"use client";

import React from "react";
import { useAuraGen } from "@/hooks/useAuraGen";
import DynamicRender from "@/components/DynamicRender";

export default function Home() {
  const {
    isConnected,
    dynamicCode,
    trackClick,
    startHesitationTimer,
    clearHesitationTimer,
  } = useAuraGen("ws://localhost:8080");

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      {/* Connection Indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-md">
        <span
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-xs font-mono text-slate-300">
          {isConnected ? "Engine Connected" : "Engine Disconnected"}
        </span>
      </div>

      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AuraGen Dynamic UI Test
        </h1>

        <p className="text-slate-400 text-sm">
          Click the button repeatedly (Rage Clicks) or hover without clicking (Hesitation) to trigger an automated UI mutation injection from the backend!
        </p>

        {/* Telemetry Trigger Button */}
        <div className="p-8 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-sm space-y-4">
          <button
            onClick={trackClick}
            onMouseEnter={startHesitationTimer}
            onMouseLeave={clearHesitationTimer}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Click Me Rapidly or Hover 3s
          </button>
        </div>

        {/* ⚡ Dynamic UI Injector Slot */}
        {dynamicCode ? (
          <div className="mt-8">
            <DynamicRender code={dynamicCode} />
          </div>
        ) : (
          <div className="mt-6 p-4 border border-dashed border-slate-700 rounded-xl text-slate-500 text-xs font-mono">
            Waiting for friction telemetry to trigger dynamic UI mutation...
          </div>
        )}
      </div>
    </main>
  );
}