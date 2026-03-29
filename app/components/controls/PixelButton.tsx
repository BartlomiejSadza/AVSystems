'use client';

import React, { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#00E436] text-[#111827] border-[#00b02a] hover:bg-[#00c22e] active:bg-[#009922]',
  secondary: 'bg-[#29ADFF] text-[#111827] border-[#0078cc] hover:bg-[#0099ee] active:bg-[#0077bb]',
  danger: 'bg-[#FF004D] text-[#f9fafb] border-[#bb0030] hover:bg-[#dd0040] active:bg-[#aa0030]',
};

export function PixelButton({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={[
        // Base pixel-art styling — no border-radius, no anti-aliasing on borders
        'inline-flex items-center justify-center',
        'min-w-[48px] min-h-[48px]',
        'px-4 py-2',
        'border-2',
        'font-[family-name:var(--font-pixel)]',
        'text-xs leading-none',
        // Pixel-art shadow gives the "3D pressed" effect
        'shadow-[4px_4px_0px_rgba(0,0,0,0.6)]',
        // Smooth press animation
        'transition-transform duration-75 ease-in-out',
        'active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.6)]',
        // Cursor
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        // Variant colours
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {label}
    </button>
  );
}

export default PixelButton;
