"use client";

import React, { useMemo } from "react";
import * as Babel from "@babel/standalone";

interface DynamicRenderProps {
  code: string;
}

export default function DynamicRender({ code }: DynamicRenderProps) {
  const Component = useMemo(() => {
    if (!code) return null;

    try {
      console.log("🎨 DynamicRender compiling raw JSX code...");

      // 1. Transform JSX and modern ES6 to runnable ES5
      const transformResult = Babel.transform(code, {
        presets: ["react", "env"],
        filename: "dynamic.tsx",
      });

      const transformedCode = transformResult.code || "";

      // 2. Create CommonJS export containers
      const exports: { default?: React.ComponentType } = {};
      const module = { exports };

      // 3. Safely evaluate component factory
      const runComponent = new Function("React", "exports", "module", transformedCode);
      runComponent(React, exports, module);

      // 4. Extract default component or exported function
      return module.exports.default || (module.exports as unknown as React.ComponentType);
    } catch (err) {
      console.error("❌ DynamicRender compilation error:", err);
      return () => (
        <div className="p-4 bg-red-950/50 border border-red-500 rounded-xl text-red-200 text-xs font-mono">
          ⚠️ Syntax error in generated UI mutation payload.
        </div>
      );
    }
  }, [code]);

  if (!Component) return null;

  return (
    <div className="w-full transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
      <Component />
    </div>
  );
}