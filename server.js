const { Server } = require('socket.io');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const io = new Server(5000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const clientHistory = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  clientHistory.set(socket.id, { lastX: 0, lastY: 0, lastTime: Date.now(), score: 0, isGenerating: false });

  socket.on('telemetry_event', async (data) => {
    if (data && data.type === 'mouse_move') {
      if (!clientHistory.has(socket.id)) {
        clientHistory.set(socket.id, { lastX: Number(data.x) || 0, lastY: Number(data.y) || 0, lastTime: Date.now(), score: 0, isGenerating: false });
      }

      const history = clientHistory.get(socket.id);
      const currentTime = Date.now();
      const timeDelta = currentTime - history.lastTime;

      if (timeDelta > 50) {
        const deltaX = Number(data.x) - history.lastX;
        const deltaY = Number(data.y) - history.lastY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const velocity = distance / timeDelta;
        let calculatedScore = Math.min(100, Math.floor(velocity * 45));
        
        history.score = Math.round((history.score * 0.7) + (calculatedScore * 0.3));
        history.lastX = Number(data.x);
        history.lastY = Number(data.y);
        history.lastTime = currentTime;

        socket.emit('telemetry', { score: history.score });

        if (history.score > 20 && !history.isGenerating) {
          history.isGenerating = true;
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents: `The user's current cognitive load score is high (${history.score}), indicating high user friction. Generate an adaptive UI intervention in strict JSON format with exactly these two keys:
              {
                "message": "A short, helpful text intervention to simplify their workflow",
                "action": "FOCUS_MODE"
              }`,
              config: {
                responseMimeType: "application/json"
              }
            });
            
            const parsedData = JSON.parse(response.text);
            socket.emit('ai_intervention', parsedData);
          } catch (error) {
            console.error('Error generating content from Gemini SDK:', error);
          } finally {
            history.isGenerating = false;
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    clientHistory.delete(socket.id);
  });
});

console.log('Socket.IO telemetry server with GenAI integration running on port 5000');