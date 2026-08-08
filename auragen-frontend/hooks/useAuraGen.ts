import { useEffect, useRef, useCallback } from "react";

export function useAuraGen() {
  const wsRef = useRef<WebSocket | null>(null);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8080");

    socket.onopen = () => {
      console.log("🟢 [CLIENT] WebSocket connected to ws://127.0.0.1:8080");
    };

    socket.onerror = (err) => {
      console.error("🔴 [CLIENT] WebSocket connection error:", err);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  // Scans all interactive form controls on the page to build the state object
  const captureCurrentFormState = useCallback(() => {
    const formState: Record<string, string> = {};
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    );

    inputs.forEach((input) => {
      // Safely access placeholder only if the property exists on the element
      const placeholderVal = "placeholder" in input ? (input as HTMLInputElement | HTMLTextAreaElement).placeholder : "";
      const key = input.name || input.id || placeholderVal;

      if (key) {
        formState[key] = input.value;
      }
    });

    return formState;
  }, []);

  const sendTelemetry = useCallback((frictionType: "rageClick" | "hesitation") => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const currentState = captureCurrentFormState();
      const payload = {
        rageClicks: frictionType === "rageClick" ? 4 : 0,
        hesitationTime: frictionType === "hesitation" ? 3000 : 0,
        currentState: currentState,
        timestamp: Date.now(),
      };

      console.log("📤 [CLIENT] Dispatching Telemetry Payload:", payload);
      wsRef.current.send(JSON.stringify(payload));
    }
  }, [captureCurrentFormState]);

  const handlePointerDown = useCallback(() => {
    clickCountRef.current += 1;

    if (clickCountRef.current >= 4) {
      console.log("⚠️ [CLIENT] Rage Click Detected!");
      sendTelemetry("rageClick");
      clickCountRef.current = 0;
    }

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);
  }, [sendTelemetry]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      console.log("⚠️ [CLIENT] Hesitation Detected (3s Hover)!");
      sendTelemetry("hesitation");
    }, 3000);
  }, [sendTelemetry]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  return {
    wsRef,
    handlePointerDown,
    handleMouseEnter,
    handleMouseLeave,
  };
}