const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Setup WebSockets and allow your frontend (running on port 3000) to talk to it
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Listen for when the frontend connects
io.on('connection', (socket) => {
    console.log('⚡ A user connected to the backend tracking system');

    // Listen for the "frustration-spiked" message from the frontend hook
    socket.on('frustration-spiked', (data) => {
        console.log(`⚠️ ALERT: User is highly frustrated! Cognitive Load Score: ${data.score}`);
        
        // Next week, this is where we will trigger the AI (GPT-4o) to generate a new UI!
        // For now, we just acknowledge it.
        socket.emit('backend-response', { 
            message: "Backend received frustration! Ready to generate new wizard UI." 
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected');
    });
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`🚀 Brain/Backend server is running on http://localhost:${PORT}`);
});