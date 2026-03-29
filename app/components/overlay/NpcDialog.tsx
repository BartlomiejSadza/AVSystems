'use client';

import React from 'react';

interface NpcDialogProps {
  message: string | null;
  visible: boolean;
  onDismiss: () => void;
}

export function NpcDialog({ message, visible, onDismiss }: NpcDialogProps) {
  if (!visible || !message) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 max-w-[400px] [animation:npc-slide-in_0.2s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Outer pixel border */}
      <div className="flex flex-col gap-2 border-2 border-[#7E2553] bg-[#1D2B53] p-3">
        {/* Header row: portrait + close button */}
        <div className="flex items-start justify-between gap-2">
          {/* NPC Portrait */}
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[#C2C3C7] bg-[#7E2553] text-sm [image-rendering:pixelated]"
            aria-label="Officer Pixel portrait"
          >
            {'👮'}
          </div>

          {/* Officer label */}
          <span className="flex-1 self-center font-[family-name:var(--font-pixel)] text-[8px] uppercase leading-tight tracking-widest text-[#C2C3C7]">
            Officer Pixel
          </span>

          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border-2 border-[#C2C3C7] bg-[#7E2553] font-[family-name:var(--font-pixel)] text-[10px] leading-none text-[#FFF1E8]"
          >
            X
          </button>
        </div>

        {/* Message */}
        <p className="m-0 font-[family-name:var(--font-pixel)] text-[10px] leading-relaxed text-[#FFF1E8]">
          {message}
        </p>
      </div>
    </div>
  );
}

export default NpcDialog;
