'use client';

import React from 'react';

interface TooltipProps {
  content: string | null;
  x: number;
  y: number;
}

export function Tooltip({ content, x, y }: TooltipProps) {
  if (content === null) return null;

  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        // Offset upward so the tail points at target below
        transform: 'translate(-50%, calc(-100% - 10px))',
        zIndex: 50,
        maxWidth: '200px',
        pointerEvents: 'none',
      }}
    >
      {/* Bubble body */}
      <div
        style={{
          backgroundColor: '#1D2B53',
          border: '2px solid #7E2553',
          color: '#FFF1E8',
          padding: '4px 8px',
          imageRendering: 'pixelated',
        }}
        className="font-[family-name:var(--font-pixel)] text-[10px] leading-tight"
      >
        {content}
      </div>

      {/* Tail triangle pointing downward */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #7E2553',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Inner fill triangle to match background */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '4px solid #1D2B53',
            position: 'absolute',
            top: -7,
            left: -4,
          }}
        />
      </div>
    </div>
  );
}

export default Tooltip;
