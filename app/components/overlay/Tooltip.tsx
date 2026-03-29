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
      className="pointer-events-none absolute z-50 max-w-[200px] -translate-x-1/2"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      {/* Bubble body */}
      <div className="border-2 border-[#7E2553] bg-[#1D2B53] px-2 py-1 font-[family-name:var(--font-pixel)] text-[10px] leading-tight text-[#FFF1E8] [image-rendering:pixelated]">
        {content}
      </div>

      {/* Tail triangle pointing downward */}
      <div className="relative mx-auto h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#7E2553]">
        {/* Inner fill triangle to match background */}
        <div className="absolute -left-1 -top-[7px] h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-[#1D2B53]" />
      </div>
    </div>
  );
}

export default Tooltip;
