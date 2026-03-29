'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface PixelSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function PixelSelect({ options, value, onChange, label }: PixelSelectProps) {
  const selectId = label ? `pixel-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="font-[family-name:var(--font-pixel)] text-[10px] text-[#9ca3af] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            // Pixel-art border — no radius
            'appearance-none',
            'w-full',
            'min-h-[48px]',
            'px-3 py-2 pr-8',
            'bg-[#1f2937]',
            'text-[#f9fafb]',
            'border-2 border-[#4b5563]',
            'font-[family-name:var(--font-pixel)] text-xs leading-none',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.5)]',
            'cursor-pointer',
            'hover:border-[#29ADFF]',
            'focus:outline-none focus:border-[#29ADFF]',
            'transition-colors duration-100',
          ].join(' ')}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1f2937] text-[#f9fafb]">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom pixel-art chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg
            className="h-3 w-3 text-[#9ca3af]"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 12 12"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default PixelSelect;
