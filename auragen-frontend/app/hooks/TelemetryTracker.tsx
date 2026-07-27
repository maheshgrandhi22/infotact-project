import { Server, Socket } from 'socket.io';

const io = new Server(5000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const clientHistory = new Map<string, { lastX: number; lastY: number; lastTime: number; score: number }>();

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  clientHistory.set(socket.id, { lastX: 0, lastY: 0, lastTime: Date.now(), score: 0 });

  socket.on('telemetry_event', (data: any) => {
    if (data && typeof data === 'object' && 'type' in data && data.type === 'mouse_move') {
      if (!clientHistory.has(socket.id)) {
        clientHistory.set(socket.id, { lastX: Number(data.x) || 0, lastY: Number(data.y) || 0, lastTime: Date.now(), score: 0 });
      }

      const history = clientHistory.get(socket.id);
      if (!history) return;

      const currentTime = Date.now();
      const timeDelta = currentTime - history.lastTime;

      if (timeDelta > 50) {
        const deltaX = Number(data.x) - history.lastX;
        const deltaY = Number(data.y) - history.lastY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const velocity = distance / timeDelta;
        let calculatedScore = Math.min(100, Math.floor(velocity * 15));
        
        history.score = Math.round((history.score * 0.7) + (calculatedScore * 0.3));
        history.lastX = Number(data.x);
        history.lastY = Number(data.y);
        history.lastTime = currentTime;

        socket.emit('telemetry', { score: history.score });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    clientHistory.delete(socket.id);
  });
});

console.log('Socket.IO telemetry server running on port 5000');