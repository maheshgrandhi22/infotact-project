console.log("DEBUG: Checking API Key...");
console.log("Key found:", process.env.GEMINI_API_KEY ? "Yes, length is " + process.env.GEMINI_API_KEY.length : "NO! Key is missing.");
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let lastGenerationTime = 0;

io.on('connection', (socket) => {
  socket.on('telemetry_data', async (data) => {
    const now = Date.now();
    if (data.score > 10 && (now - lastGenerationTime) > 60000) {
      lastGenerationTime = now;
      try {
        const result = await model.generateContent("Generate a simplified React wizard component using Tailwind CSS. Return ONLY the code.");
        const generatedCode = result.response.text();
        
        // You can keep your existing validateGeneratedCode function here
        socket.emit('code_update', { code: generatedCode });
      } catch (err) {
        console.error("Gemini Error:", err.message);
      }
    }
  });
});

server.listen(5000, () => console.log("[AuraGen] Backend running on port 5000 with Gemini"));