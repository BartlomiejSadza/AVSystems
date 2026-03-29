'use client';

import React from 'react';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function SpeedSlider({ value, onChange, min = 1, max = 10, label }: SpeedSliderProps) {
  const sliderId = label ? `pixel-slider-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={sliderId}
            className="font-[family-name:var(--font-pixel)] text-[10px] text-[#9ca3af] uppercase tracking-wider"
          >
            {label}
          </label>
          <span className="font-[family-name:var(--font-pixel)] text-[10px] text-[#29ADFF]">
            {value}x
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          // Pixel-art range input — styled via inline styles + global CSS class
          // Tailwind can't target ::-webkit-slider-thumb directly so we use a
          // dedicated CSS class defined below via style jsx or a global class.
          className="pixel-slider w-full"
          style={
            {
              // CSS custom property drives the filled-track width
              '--slider-pct': `${((value - min) / (max - min)) * 100}%`,
            } as React.CSSProperties
          }
        />
      </div>
      {/* Tick marks */}
      <div className="flex justify-between px-[2px]">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((tick) => (
          <span
            key={tick}
            className={`font-[family-name:var(--font-pixel)] text-[8px] ${
              tick === value ? 'text-[#29ADFF]' : 'text-[#4b5563]'
            }`}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SpeedSlider;
