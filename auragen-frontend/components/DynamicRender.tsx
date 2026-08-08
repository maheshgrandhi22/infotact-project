'use client';

import React, { ComponentType, RefObject, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DynamicRenderProps {
  /** Optional WebSocket ref passed down to dynamic components */
  wsRef?: RefObject<WebSocket | null>;
  /** The dynamically resolved or compiled component to render */
  component?: ComponentType<any>;
  /** Optional fallback UI to display while component suspends */
  fallback?: React.ReactNode;
  /** Props passed directly through to the target component */
  componentProps?: Record<string, any>;
  /** Optional custom children override */
  children?: React.ReactNode;
}

/**
 * DynamicRender Component
 * Smoothly morphs and renders dynamic components with state persistence and Framer Motion transitions.
 */
export const DynamicRender: React.FC<DynamicRenderProps> = ({
  wsRef,
  component: Component,
  fallback = (
    <div className="p-4 text-sm text-slate-400 animate-pulse bg-slate-800/50 rounded-lg">
      Generating contextual UI...
    </div>
  ),
  componentProps = {},
  children,
}) => {
  // Determine animation key based on component identity or props
  const componentKey = Component
    ? Component.displayName || Component.name || 'dynamic-ui'
    : 'empty-ui';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={componentKey}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full"
      >
        {children ? (
          children
        ) : Component ? (
          <Suspense fallback={fallback}>
            <Component wsRef={wsRef} {...componentProps} />
          </Suspense>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-slate-700 bg-slate-900/40 text-slate-400 text-sm text-center">
            Awaiting dynamic component injection...
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DynamicRender;