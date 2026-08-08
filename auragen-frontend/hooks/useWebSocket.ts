'use client';

import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string = 'ws://localhost:8080') {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[AuraGen WS] Connected to backend WebSocket server.');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[AuraGen WS] Received message:', message);
      } catch (err) {
        console.error('[AuraGen WS] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[AuraGen WS] Disconnected from server.');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('[AuraGen WS] Error occurred:', error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { wsRef, isConnected };
}