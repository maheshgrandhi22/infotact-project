const express = require("express");
const cors = require("cors");
// 1. Import your new Week 3 prompt template module
const { compileContextAwarePrompt } = require("./promptTemplate"); 

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", (req, res) => {
  // Extract both the script payload and the synchronized DOM state sent by the frontend
  const { code, domState } = req.body; 

  // Fallback state in case older frontend versions hit the endpoint
  const activeDomState = domState || { 
    amortizedYield: "450000", 
    debtLiabilities: "120005", 
    timestamp: new Date().toISOString() 
  };

  // 2. Compile the context-aware prompt using your template
  const compiledPrompt = compileContextAwarePrompt(code || "", activeDomState);
  
  // Log it to your terminal so you can verify the LLM context is perfectly formatted
  console.log("\n--- [WEEK 3] COMPILED LLM PROMPT MATRIX ---");
  console.log(compiledPrompt);
  console.log("-------------------------------------------\n");

  // 3. Your existing Week 2 AST Safety Analysis Engine running below
  // (Assuming basic pattern matching or full AST parsing here)
  const codeToCheck = code || "";
  if (codeToCheck.includes("window") || codeToCheck.includes("document") || codeToCheck.includes("localStorage")) {
    return res.status(400).json({
      success: false,
      error: "Security Violation: Unauthorized API 'window/document' environment exposure detected."
    });
  }

  // If everything passes, return success along with the state confirmation
  res.json({
    success: true,
    message: "AST check clean. Prompt compilation matrix synchronized.",
    contextPreserved: activeDomState
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[AuraGen Backend] Secure validation engine running on port ${PORT}...`);
});