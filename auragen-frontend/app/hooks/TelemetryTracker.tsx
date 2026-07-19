"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// Connect to the backend
const socket = io("http://localhost:5000");

export default function TelemetryTracker() {
  const [score, setScore] = useState(0);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [status, setStatus] = useState("Monitoring friction...");
  
  // Track mouse movement to calculate "friction"
  const mouseMoveCount = useRef(0);

  useEffect(() => {
    // 1. Listen for AI UI updates
    socket.on("code_update", (data) => {
      setGeneratedCode(data.code);
      setStatus("UI Updated successfully!");
    });

    socket.on("code_error", (err) => {
      setStatus(`Error: ${err.message}`);
    });

    // 2. Friction calculation loop (every 1 second)
    const interval = setInterval(() => {
      const currentFriction = mouseMoveCount.current;
      setScore(currentFriction);

      // Send to backend if friction is high
      if (currentFriction > 10) {
        socket.emit("telemetry_data", { score: currentFriction });
      }

      // Reset for next window
      mouseMoveCount.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 3. Increment counter on mouse move
  const handleMouseMove = () => {
    mouseMoveCount.current += 1;
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ padding: '20px', border: '1px solid #333' }}>
      <h2 style={{ color: '#4ade80' }}>{status}</h2>
      <p style={{ fontSize: '20px' }}>Cognitive Load Score: {score}</p>
      
      {generatedCode && (
        <div style={{ marginTop: '20px', backgroundColor: '#1a1a1a', padding: '15px' }}>
          <h3>Generated UI Component:</h3>
          <pre style={{ color: 'white' }}>{generatedCode}</pre>
        </div>
      )}
    </div>
  );
}