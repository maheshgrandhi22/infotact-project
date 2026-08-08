import React from 'react';
import * as Babel from '@babel/standalone';

export function compileJSX(codeString: string): React.ComponentType<any> {
  try {
    const transformed = Babel.transform(codeString, {
      presets: ['react'],
    }).code;

    const renderComponent = new Function('React', `${transformed}; return DynamicFix;`);
    
    return renderComponent(React);
  } catch (err: any) {
    console.error('[AuraGen compileJSX Error]:', err);
    throw err;
  }
}