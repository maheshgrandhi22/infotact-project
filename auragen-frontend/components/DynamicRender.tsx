'use client';

import React from 'react';

interface DynamicRenderProps {
  wsRef: React.RefObject<WebSocket | null>;
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
}

export default function DynamicRender({
  component: Component,
  componentProps = {},
}: DynamicRenderProps) {
  if (!Component) {
    return null;
  }

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      <Component {...componentProps} />
    </div>
  );
}