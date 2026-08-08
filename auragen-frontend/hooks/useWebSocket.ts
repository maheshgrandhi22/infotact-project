'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    sendWsMessage?: (data: any) => void;
  }
}

export function useWebSocket(
  url: string = 'ws://127.0.0.1:8080',
  onMessageCallback?: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const connect = () => {
      try {
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            console.log('[AuraGen WS] Connected to WebSocket backend.');
            setIsConnected(true);
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (onMessageCallback && isMounted) {
              onMessageCallback(message);
            }
          } catch (err) {
            console.warn('[AuraGen WS] Failed to parse message format.');
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
          }
        };

        ws.onerror = (err) => {
          if (isMounted) {
            console.warn('[AuraGen WS] Connection error or server offline.');
          }
        };
      } catch (e) {
        console.error('[AuraGen WS] Initialization error:', e);
      }
    };

    connect();

    window.sendWsMessage = (data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      } else {
        console.warn('[AuraGen WS] Cannot send message: WebSocket is not open.');
      }
    };

    return () => {
      isMounted = false;
      delete window.sendWsMessage;
      if (ws) {
        ws.close();
      }
    };
  }, [url, onMessageCallback]);

  return { wsRef, isConnected };
}