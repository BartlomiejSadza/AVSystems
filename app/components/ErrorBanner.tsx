'use client';

import { useSimulationContext } from './SimulationProvider';

export function ErrorBanner() {
  const { state, dispatch } = useSimulationContext();

  if (!state.error) {
    return null;
  }

  const handleDismiss = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <div
      className="bg-status-error-bg border border-traffic-red/40 rounded-lg px-4 py-3 flex items-start gap-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      <span
        className="text-traffic-red text-lg leading-none mt-0.5 flex-shrink-0"
        aria-hidden="true"
      >
        &#9888;
      </span>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-status-error break-words">{state.error}</p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-traffic-red hover:text-status-error transition-colors focus:outline-none focus:ring-2 focus:ring-traffic-red rounded"
        aria-label="Dismiss error"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          &times;
        </span>
      </button>
    </div>
  );
}
