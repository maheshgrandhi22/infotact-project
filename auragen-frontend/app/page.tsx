"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Week3Workspace() {
  const [codePayload, setCodePayload] = useState(
`// AuraGen Live Generation Block
const yieldValue = "$450,000";
const liabilityValue = "$120,000";

// Testing baseline evaluation
console.log("Compiling declaration data...");`
  );
  
  const [amortizedYield, setAmortizedYield] = useState("450000");
  const [debtLiabilities, setDebtLiabilities] = useState("120005");
  const [isCompiling, setIsCompiling] = useState(false);
  const [cognitiveLoad, setCognitiveLoad] = useState(42.00);
  const [validationLog, setValidationLog] = useState<string[]>([
    "[System] Core engine initialized.",
    "[System] Ready for code declaration execution tokens...",
    "[Telemetry] Monitoring user cognitive load metrics..."
  ]);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: ""
  });

  const [uiViewMode, setUiViewMode] = useState<"static" | "generated">("static");

  // Telemetry Trigger: Automatically morph layout if cognitive load spikes past 60
  useEffect(() => {
    if (cognitiveLoad > 60 && uiViewMode === "static") {
      setUiViewMode("generated");
      setValidationLog(prev => [
        ...prev,
        `[TELEMETRY] Cognitive load threshold exceeded (${cognitiveLoad.toFixed(2)}). Triggering adaptive UI layout transformation...`
      ]);
      setStatus({ 
        type: "success", 
        text: "Cognitive load spike detected. Layout optimized to reduce user frustration." 
      });
    } else if (cognitiveLoad <= 60 && uiViewMode === "generated") {
      setUiViewMode("static");
    }
  }, [cognitiveLoad, uiViewMode]);

  const simulateFrustrationSpike = () => {
    // Simulate a user struggling with the form, spiking the metric
    setCognitiveLoad(78.50);
  };

  const resetTelemetry = () => {
    setCognitiveLoad(42.00);
    setStatus({ type: null, text: "" });
  };

 const runSafetyCompilation = async () => {
    setIsCompiling(true);
    
    // Package active script text and state tokens together
    const transmissionPayload = {
      code: codePayload, // Ensure this key is 'code' to match req.body.code on the server
      domState: {
        amortizedYield: amortizedYield,
        debtLiabilities: debtLiabilities,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add this header to tell browsers explicitly NOT to upgrade this background API call to HTTPS
          "Upgrade-Insecure-Requests": "0" 
        },
        body: JSON.stringify(transmissionPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus({ type: "error", text: data.error || "AST Compilation Denied." });
        setValidationLog(prev => [
          ...prev, 
          `[CRITICAL] ${data.error || "Security token validation failed."}`
        ]);
      } else {
        setStatus({ type: "success", text: "Compilation successful. Context payload preserved." });
        setValidationLog(prev => [
          ...prev, 
          `[SUCCESS] Sync passed. Yield: ${amortizedYield}, Liabilities: ${debtLiabilities}`
        ]);
        
        setUiViewMode(prev => prev === "static" ? "generated" : "static");
      }
    } catch (err) {
      setStatus({ type: "error", text: "Local connection to validation server on port 5000 failed." });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f141c] text-slate-100 flex flex-col h-screen font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#161b24] px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            AuraGen Dynamic Development Environment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Week 3: Contextual Awareness & Fluid Morphing Layouts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
  type="button" 
  onClick={(e) => {
    e.preventDefault();
    runSafetyCompilation();
  }}
>
  ✨Spike Frustration
</button>
          {uiViewMode === "generated" && (
            <button
              onClick={resetTelemetry}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2 rounded transition-all uppercase tracking-wide"
            >
              Reset
            </button>
          )}
          <button 
            onClick={runSafetyCompilation}
            disabled={isCompiling}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded transition-all tracking-wide uppercase"
          >
            {isCompiling ? "Syncing..." : "Manual Sync"}
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column */}
        <section className="w-1/2 border-r border-slate-800 flex flex-col bg-[#121720]">
          <div className="bg-[#161b24] px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">Contextual Sandbox</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50 font-mono">State Aware</span>
          </div>
          
          <div className="flex-1 p-4 flex flex-col space-y-4 overflow-y-auto">
            <div className="flex-1 flex flex-col">
              <textarea
                value={codePayload}
                onChange={(e) => setCodePayload(e.target.value)}
                className="flex-1 w-full p-4 bg-[#0a0d14] border border-slate-800 rounded font-mono text-sm text-emerald-400 focus:outline-none focus:border-slate-700 resize-none shadow-inner"
              />
            </div>
            
            <div className="h-44 bg-[#070a0f] border border-slate-800 rounded p-3 font-mono text-xs overflow-y-auto flex flex-col space-y-1 shadow-inner">
              <div className="text-slate-500 border-b border-slate-900 pb-1 mb-1 text-[10px] uppercase font-sans">Telemetry & Console Logs</div>
              {validationLog.map((log, idx) => (
                <div key={idx} className={log.includes("[CRITICAL]") ? "text-rose-400" : log.includes("[TELEMETRY]") ? "text-amber-400" : log.includes("[SUCCESS]") ? "text-cyan-400" : "text-slate-400"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column (Adaptive View) */}
        <section className="w-1/2 bg-[#0d1117] flex flex-col overflow-y-auto p-6 justify-center items-center">
          {status.text && (
            <div className={`w-full max-w-md p-4 mb-6 rounded border font-mono text-xs flex items-start gap-2.5 ${
              status.type === "error" ? "bg-rose-950/30 border-rose-800/60 text-rose-300" : "bg-cyan-950/30 border-cyan-800/60 text-cyan-300"
            }`}>
              <span>{status.type === "error" ? "🛑" : "🛡️"}</span>
              <div>{status.text}</div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              key={uiViewMode}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md bg-[#161b24] border border-slate-800 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {uiViewMode === "static" ? "Infotact Portal" : "Infotact Adaptive Dashboard v3"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Form 1099-X</p>
                </div>
                <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded border ${
                  uiViewMode === "static" ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-amber-950 text-amber-400 border-amber-900/50 font-bold"
                }`}>
                  {uiViewMode === "static" ? "Standard Layout" : "Frustration Optimized"}
                </span>
              </div>

              <div className={`p-6 ${uiViewMode === "generated" ? "space-y-8 bg-[#18202d]" : "space-y-5"}`}>
                <div className="bg-[#1c232f] border-l-2 border-amber-500 p-3 rounded flex items-center justify-between text-xs">
                  <span className="text-slate-400">Frustration Metric (Cognitive Load):</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                    cognitiveLoad > 60 ? "text-rose-400 bg-rose-950/40 border-rose-900" : "text-amber-400 bg-[#121720] border-slate-800"
                  }`}>{cognitiveLoad.toFixed(2)}</span>
                </div>

                <div className={`grid ${uiViewMode === "generated" ? "grid-cols-2 gap-4" : "space-y-4"}`}>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">Gross Yield</label>
                    <input type="text" value={amortizedYield} onChange={(e) => setAmortizedYield(e.target.value)} className="w-full bg-[#0a0d14] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">Debt Liabilities</label>
                    <input type="text" value={debtLiabilities} onChange={(e) => setDebtLiabilities(e.target.value)} className="w-full bg-[#0a0d14] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}