'use client';

import { useEffect, useRef } from 'react';

interface FrictionTrackerOptions {
  wsRef: React.RefObject<WebSocket | null>;
  formState: Record<string, any>;
  thresholdMs?: number;
  clickLimit?: number;
}

export function useFrictionTracker({
  wsRef,
  formState,
  thresholdMs = 1500,
  clickLimit = 3,
}: FrictionTrackerOptions) {
  const clickHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      clickHistoryRef.current = [...clickHistoryRef.current, now].filter(
        (timestamp) => now - timestamp < thresholdMs
      );

      if (clickHistoryRef.current.length >= clickLimit) {
        const target = e.target as HTMLElement;
        const payload = {
          type: 'FRICTION_DETECTED',
          event: 'RAGE_CLICK',
          targetElement: target.tagName,
          fieldId: target.getAttribute('name') || target.id || 'unknown',
          timestamp: new Date().toISOString(),
          formStateContext: formState,
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(payload));
          console.log('[FrictionTracker] Payload sent via WebSocket:', payload);
        } else {
          console.warn('[FrictionTracker] Friction detected, but WebSocket is not open.');
        }

        // Reset history after triggering event
        clickHistoryRef.current = [];
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [wsRef, formState, thresholdMs, clickLimit]);
}