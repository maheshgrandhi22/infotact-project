import { useEffect, useState, useRef, useCallback } from "react";

export interface UseAuraGenReturn {
  isConnected: boolean;
  dynamicCode: string | null;
  trackClick: () => void;
  startHesitationTimer: () => void;
  clearHesitationTimer: () => void;
}

export function useAuraGen(wsUrl: string = "ws://127.0.0.1:8080"): UseAuraGenReturn {
  const [dynamicCode, setDynamicCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const clickCount = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const hesitationTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize and maintain single WebSocket connection
  useEffect(() => {
    let socket: WebSocket | null = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("⚡ [AuraGen] Connected to WebSocket server!");
      setIsConnected(true);
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log("📥 [AuraGen] Message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "UI_MUTATION" && data.code) {
          console.log("✨ [AuraGen] Dynamic code injected!");
          setDynamicCode(data.code);
        }
      } catch (err) {
        console.error("❌ [AuraGen] Failed to parse message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ [AuraGen] WebSocket Error:", err);
    };

    socket.onclose = () => {
      console.log("🔌 [AuraGen] Disconnected from server");
      setIsConnected(false);
    };

    return () => {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [wsUrl]);

  // Guaranteed direct dispatch to active socket
  const sendTelemetry = useCallback((telemetryData: { rageClicks: number; hesitationTime: number }) => {
    const activeWs = wsRef.current;

    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      console.log("📤 [AuraGen] Direct dispatching frame:", telemetryData);
      activeWs.send(JSON.stringify(telemetryData));
    } else {
      console.warn("⚠️ [AuraGen] Socket not ready. State:", activeWs ? activeWs.readyState : "NULL");
    }
  }, []);

  const trackClick = useCallback(() => {
    clickCount.current += 1;

    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 1500);

    if (clickCount.current >= 4) {
      console.warn("⚠️ Friction Detected: Rage Clicking!");
      sendTelemetry({ rageClicks: clickCount.current, hesitationTime: 0 });
      clickCount.current = 0;
    }
  }, [sendTelemetry]);

  const startHesitationTimer = useCallback(() => {
    if (hesitationTimer.current) clearTimeout(hesitationTimer.current);

    hesitationTimer.current = setTimeout(() => {
      console.warn("⚠️ Friction Detected: User Hesitation!");
      sendTelemetry({ rageClicks: 0, hesitationTime: 3000 });
    }, 3000);
  }, [sendTelemetry]);

  const clearHesitationTimer = useCallback(() => {
    if (hesitationTimer.current) clearTimeout(hesitationTimer.current);
  }, []);

  return {
    isConnected,
    dynamicCode,
    trackClick,
    startHesitationTimer,
    clearHesitationTimer,
  };
}