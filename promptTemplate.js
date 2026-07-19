/**
 * AuraGen Context-Aware Prompt Compiler
 * Compiles prompt metrics and live UI state tokens into an LLM-ready prompt matrix.
 */
function compileContextAwarePrompt(userPrompt, domState, isFrustrated) {
  // Base system instructions for standard operations
  let systemDirective = `You are AuraGen AI, an advanced engineering assistant. 
Your job is to analyze the user's local code snippet and optimize their mathematical parameters.
Be concise, accurate, and output clear context adjustments.`;

  // Dynamic override if the frustration feedback tracker trips on the frontend
  if (isFrustrated) {
    systemDirective = `
[TELEMETRY ALERT: USER FRUSTRATION THRESHOLD EXCEEDED]
1. You notice the user is rapidly iterating or stuck in a repetitive cycle. Shift to an empathetic, supportive peer persona.
2. Acknowledge the block directly but concisely (e.g., "Let's debug this pipeline step together...").
3. Analyze why their current parameters (Gross Yield: ${domState.amortizedYield}, Liabilities: ${domState.debtLiabilities}) might be causing calculation bottlenecks.
4. Provide exactly 2 micro-suggestions or alternative inputs they can try immediately to lower their cognitive load.`;
  }

  // Compile the final prompt matrix block that prints out on the terminal screen
  return `
======================================================================
--- [AURA GEN LIVE COMPILATION MATRIX] ---
======================================================================
[SYSTEM CONFIGURATION]
${systemDirective.trim()}

[ACTIVE STATE VARIABLES]
- Gross Yield Value: ${domState.amortizedYield}
- Debt Liabilities Value: ${domState.debtLiabilities}
- Timestamp: ${domState.timestamp || new Date().toISOString()}
- Frustration Signal Active: ${isFrustrated ? "⚠️ TRUE (High Click Velocity Detected)" : "✅ FALSE (Stable Interaction)"}

[USER DATA SNIPPET]
${userPrompt}
======================================================================
  `;
}

// Ensure the function is exported exactly under this key name so server.js can read it
module.exports = { compileContextAwarePrompt };