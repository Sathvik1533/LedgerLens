import React from 'react';
import { useDemoSimulation } from '../context/DemoSimulationContext';

interface DemoRunControlsProps {
  className?: string;
  onRunCreated?: () => void;
}

export const DemoRunControls: React.FC<DemoRunControlsProps> = ({ className = '', onRunCreated }) => {
  const {
    isDemoMode,
    isSimulating,
    demoRun,
    startNewDemoRun,
    clearToZeroRecords,
    exitDemoMode,
  } = useDemoSimulation();

  const handleStartRun = async () => {
    await startNewDemoRun();
    if (onRunCreated) {
      onRunCreated();
    }
  };

  return (
    <div
      data-testid="demo-run-controls"
      className={`border border-rule bg-surface p-4 rounded-xs shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-sans ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-brass animate-ping' : isDemoMode ? 'bg-brass' : 'bg-ledger-green'}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
            Dynamic Reconciliation Simulation
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-canvas border border-rule text-ink-secondary rounded-xs">
            Demo data only
          </span>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed">
          {isDemoMode && demoRun ? (
            <span>
              Active simulation batch: <strong className="font-mono text-ink font-semibold">{demoRun.runId}</strong> &bull; Seed: <strong className="font-mono text-ink font-semibold">{demoRun.seed}</strong> &bull; {demoRun.totalRecords} records generated &bull; {demoRun.matchedCount} matched ({demoRun.matchRate}%) &bull; {demoRun.reviewCount} needing review
            </span>
          ) : (
            <span>
              Generate a fresh synthetic 60-record batch with a recorded seed, run reconciliation, and update metrics dynamically.
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {isDemoMode && (
          <button
            type="button"
            onClick={exitDemoMode}
            className="px-3 py-1.5 text-xs font-mono border border-rule hover:bg-canvas text-ink-secondary hover:text-ink rounded-xs transition-colors"
          >
            Return to live benchmark
          </button>
        )}

        <button
          type="button"
          onClick={clearToZeroRecords}
          disabled={isSimulating}
          className="px-3 py-1.5 text-xs font-mono border border-rule hover:bg-canvas text-ink-secondary hover:text-ink rounded-xs transition-colors disabled:opacity-50"
          title="Clear all demo records to show 0 records empty state"
        >
          Clear demo records (0)
        </button>

        <button
          type="button"
          data-testid="start-demo-run-btn"
          onClick={handleStartRun}
          disabled={isSimulating}
          className="px-3.5 py-1.5 bg-ink text-canvas hover:bg-ink/90 font-medium text-xs rounded-xs transition-colors flex items-center gap-2 disabled:opacity-50 shadow-subtle"
        >
          <span className="text-brass font-bold">✦</span>
          <span>{isSimulating ? 'Comparing 60 records...' : isDemoMode ? 'Generate next demo run' : 'Start a new demo run'}</span>
        </button>
      </div>
    </div>
  );
};
