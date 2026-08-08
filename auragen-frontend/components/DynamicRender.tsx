'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicRenderProps {
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  wsRef?: React.RefObject<WebSocket | null>;
  children?: React.ReactNode;
}

export default function DynamicRender({
  component: Component,
  componentProps = {},
  wsRef,
  children,
}: DynamicRenderProps) {
  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {Component ? (
          <motion.div
            key="dynamic-component"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Component {...componentProps} wsRef={wsRef} />
          </motion.div>
        ) : children ? (
          <motion.div
            key="children-slot"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500"
          >
            Awaiting dynamic component injection...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}