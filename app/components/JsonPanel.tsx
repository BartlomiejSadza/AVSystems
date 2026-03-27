'use client';

import { useRef, useState } from 'react';
import { useSimulationContext } from './SimulationProvider';
import { commandArraySchema } from '../lib/simulation-adapter';

export function JsonPanel() {
  const { state, dispatch } = useSimulationContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // --- Import ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') {
        setImportError('Failed to read file contents.');
        return;
      }
      try {
        const raw = JSON.parse(text);
        const parsed = commandArraySchema.safeParse(raw);
        if (!parsed.success) {
          const messages = parsed.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join('; ');
          setImportError(`Invalid command format: ${messages}`);
          return;
        }
        dispatch({ type: 'IMPORT_COMMANDS', payload: parsed.data });
        setImportSuccess(true);
      } catch {
        setImportError('Failed to parse JSON. Make sure the file is valid JSON.');
      }
    };
    reader.onerror = () => {
      setImportError('Error reading file.');
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-imported
    e.target.value = '';
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  };

  // --- Export ---
  const handleExport = () => {
    const data = JSON.stringify(state.commands, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `simulation-commands-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-sim-surface rounded-lg p-4 space-y-3">
      <h2 className="text-base font-semibold text-sim-text">Import / Export</h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex gap-2 flex-wrap">
        {/* Import button */}
        <button
          onClick={handleImportClick}
          className="px-4 py-2 bg-sim-surface-alt text-sim-text font-medium rounded hover:bg-sim-border transition-colors text-sm"
          aria-label="Import commands from JSON file"
        >
          Import JSON
        </button>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={state.commands.length === 0}
          className="px-4 py-2 bg-sim-surface-alt text-sim-text font-medium rounded hover:bg-sim-border transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Export ${state.commands.length} commands as JSON file`}
          aria-disabled={state.commands.length === 0}
        >
          Export JSON
        </button>
      </div>

      {/* Import success */}
      {importSuccess && (
        <p className="text-xs text-traffic-green" role="status" aria-live="polite">
          Commands imported successfully.
        </p>
      )}

      {/* Import error */}
      {importError && (
        <div
          className="bg-status-error-bg border border-traffic-red/30 rounded p-2"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-xs text-status-error">{importError}</p>
          <button
            onClick={() => setImportError(null)}
            className="text-xs text-traffic-red underline mt-1 hover:opacity-80"
            aria-label="Dismiss import error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-sim-text-dim">
        {state.commands.length} command{state.commands.length !== 1 ? 's' : ''} in session. Import
        replaces all current commands.
      </p>
    </div>
  );
}
