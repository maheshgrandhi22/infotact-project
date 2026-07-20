require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

// Initialize Gemini with your environment key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  // Listener for telemetry data
  socket.on('telemetry_data', async (data, callback) => {
    console.log("Received telemetry data:", data);

    try {
      if (data && data.score > 10) {
        // Trigger AI Generation
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Generate a simplified React wizard component using Tailwind CSS.",
        });

        socket.emit('code_update', { code: response.text });
        if (callback) callback({ status: "Success" });
      } else {
        if (callback) callback({ status: "Score too low" });
      }
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      if (callback) callback({ status: "Error", message: err.message });
    }
  });
});

server.listen(5000, () => console.log("Backend running on port 5000"));