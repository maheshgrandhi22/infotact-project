"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// Connect to your Node.js backend server (Port 5000 or 5001 depending on what you chose!)
const socket = io("http://localhost:5000"); 

export default function useTelemetry() {
  const [cognitiveLoad, setCognitiveLoad] = useState(0);
  const clickTimeline = useRef<number[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    // Track Rage Clicks
    const handleThresholdClick = () => {
      const now = Date.now();
      clickTimeline.current.push(now);
      clickTimeline.current = clickTimeline.current.filter(time => now - time < 1500);

      if (clickTimeline.current.length >= 3) {
        setCognitiveLoad((prev) => {
          const newScore = Math.min(prev + 40, 100);
          // ⚡ SEND TO BACKEND IF FRUSTRATION IS HIGH
          if (newScore > 70) {
            socket.emit("frustration-spiked", { score: newScore });
          }
          return newScore;
        });
      }
    };

    // Track Mouse Velocity
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const timeDelta = now - lastMousePos.current.time;
      
      if (timeDelta > 50) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocity = distance / timeDelta;

        if (velocity > 2.5) {
          setCognitiveLoad((prev) => {
            const newScore = Math.min(prev + 2, 100);
            // ⚡ SEND TO BACKEND IF FRUSTRATION IS HIGH
            if (newScore > 70) {
              socket.emit("frustration-spiked", { score: newScore });
            }
            return newScore;
          });
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    const decayInterval = setInterval(() => {
      setCognitiveLoad((prev) => Math.max(prev - 1, 0));
    }, 200);

    window.addEventListener("click", handleThresholdClick);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("click", handleThresholdClick);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(decayInterval);
    };
  }, []);

  return cognitiveLoad;
}