"use client";
import React, { useState } from "react";

export default function FinancialForm() {
  const [formData, setFormData] = useState({ income: "", debts: "", taxId: "" });
  const cognitiveLoadScore = 42;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-2 text-indigo-400">Infotact Portal</h2>
        <p className="text-sm text-gray-400 mb-6">Complex Corporate Financial Declaration (Form 1099-X)</p>
        
        {/* Visual indicator so you can see your tracking working in real-time */}
        <div className="mb-4 p-2 bg-gray-700 rounded text-xs">
          Frustration Metric (Cognitive Load): <span className="font-bold text-red-400">{cognitiveLoadScore.toFixed(2)}</span>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 text-gray-400">Amortized Annual Gross Yield</label>
            <input 
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Enter value..."
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 text-gray-400">Subordinated Debt Liabilities</label>
            <input 
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-indigo-500" 
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 font-medium py-2 px-4 rounded transition text-sm">
            Submit Declaration
          </button>
        </form>
      </div>
    </div>
  );
}