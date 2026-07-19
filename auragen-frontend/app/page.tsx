"use client";
import TelemetryTracker from "./hooks/TelemetryTracker";

export default function Home() {
  return (
    <main style={{ padding: '20px', backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
      <h1>AuraGen Dashboard</h1>
      <TelemetryTracker />
    </main>
  );
}