'use client';

import React from 'react';
import { transform } from '@babel/standalone';

/**
 * Compiles a raw JSX component string into an executable React component.
 * @param jsxCode The raw string of TSX/JSX code.
 * @returns A callable React component function.
 */
export function compileJSX(jsxCode: string): React.ComponentType<any> {
  try {
    // 1. Transform raw JSX/TSX into ES5 JavaScript
    const transformResult = transform(jsxCode, {
      presets: ['react', 'env'],
      filename: 'DynamicComponent.tsx',
    });

    const transformedCode = transformResult?.code;

    if (!transformedCode) {
      throw new Error('Babel returned empty or null compilation code.');
    }

    // 2. Wrap transformed code into a callable evaluator passing React into local scope
    const componentFunction = new Function(
      'React',
      `${transformedCode}; return typeof DynamicFix !== 'undefined' ? DynamicFix : function NullComp() { return null; };`
    );

    // 3. Evaluate and return functional component
    const DynamicComponent = componentFunction(React);
    return DynamicComponent;
  } catch (error) {
    console.error('[AuraGen Compiler] JSX compilation failed:', error);

    // Week 4 Fallback State Requirements: Graceful degradation UI using React.createElement
    return function CompilationErrorFallback() {
      return React.createElement(
        'div',
        {
          className:
            'p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs font-mono',
        },
        'Failed to render dynamically generated UI. Fallback active.'
      );
    };
  }
}