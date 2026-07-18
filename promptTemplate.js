function compileContextAwarePrompt(scriptPayload, domState) {
  return `
You are an advanced, safety-constrained UI generation engine operating within the AuraGen framework.
Your task is to generate an optimized, highly functional React component variant based on the user runtime state.

--- CURRENT RUNSPACE CONTEXT ---
1. Active User Input Data:
   - Amortized Annual Gross Yield: "${domState.amortizedYield}"
   - Subordinated Debt Liabilities: "${domState.debtLiabilities}"

2. Base Execution Script:
${scriptPayload}
`;
}

module.exports = { compileContextAwarePrompt };
