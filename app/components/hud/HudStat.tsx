'use client';

interface HudStatProps {
  label: string;
  value: string | number;
}

export function HudStat({ label, value }: HudStatProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-[family-name:var(--font-pixel)] text-[8px] leading-tight uppercase tracking-widest text-[#C2C3C7]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-pixel)] text-xs leading-tight text-[#FFF1E8]">
        {value}
      </span>
    </div>
  );
}
