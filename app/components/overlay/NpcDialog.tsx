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
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        zIndex: 50,
        maxWidth: '400px',
        // Entrance animation driven by CSS transitions —
        // the element is mounted when visible=true so we use
        // a CSS animation keyframe instead.
        animation: 'npc-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Outer pixel border */}
      <div
        style={{
          backgroundColor: '#1D2B53',
          border: '2px solid #7E2553',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Header row: portrait + close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* NPC Portrait */}
          <div
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              backgroundColor: '#7E2553',
              border: '2px solid #C2C3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              imageRendering: 'pixelated',
            }}
            aria-label="Officer Pixel portrait"
          >
            {'👮'}
          </div>

          {/* Officer label */}
          <span
            className="font-[family-name:var(--font-pixel)] text-[8px] leading-tight uppercase tracking-widest"
            style={{ color: '#C2C3C7', flex: 1, alignSelf: 'center' }}
          >
            Officer Pixel
          </span>

          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              backgroundColor: '#7E2553',
              border: '2px solid #C2C3C7',
              color: '#FFF1E8',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            className="font-[family-name:var(--font-pixel)] text-[10px] leading-none"
          >
            X
          </button>
        </div>

        {/* Message */}
        <p
          className="font-[family-name:var(--font-pixel)] text-[10px] leading-relaxed"
          style={{ color: '#FFF1E8', margin: 0 }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default NpcDialog;
