import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllAuditTrail } from '../api/client';
import { AuditEventItem } from '../types/api';
import { CustomSelect } from '../components/CustomSelect';

export const AuditLogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllAuditTrail(100);
      setEvents(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to query immutable audit events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  // Dynamically extract distinct actors and event types
  const distinctActors = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => {
      if (e.actor) s.add(e.actor);
    });
    return Array.from(s).sort();
  }, [events]);

  const distinctTypes = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => {
      if (e.event_type) s.add(e.event_type);
    });
    return Array.from(s).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = [...events];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.case_id && e.case_id.toLowerCase().includes(q)) ||
          (e.batch_id && e.batch_id.toLowerCase().includes(q)) ||
          (e.actor && e.actor.toLowerCase().includes(q)) ||
          (e.event_type && e.event_type.toLowerCase().includes(q))
      );
    }
    if (selectedActor !== 'all') {
      result = result.filter((e) => e.actor === selectedActor);
    }
    if (selectedType !== 'all') {
      result = result.filter((e) => e.event_type === selectedType);
    }
    return result;
  }, [events, searchQuery, selectedActor, selectedType]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* 1. Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-rule pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
            <span>REVIEW HISTORY</span>
            <span>&bull;</span>
            <span className="text-ink font-semibold">Audit Trail</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            Saved review history
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans max-w-2xl leading-relaxed">
            See what was decided, by whom, when, and why. Every automatic check and human review decision is saved here permanently.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAudit}
            disabled={isLoading}
            className="px-3.5 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh history'}
          </button>
        </div>
      </div>

      {/* 2. Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div>
          <label className="text-[10px] uppercase text-ink-secondary block mb-1">Search history</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Case ID, batch, reviewer, action..."
            className="w-full px-3 py-1.5 border border-rule bg-surface text-ink text-xs rounded-xs focus:outline-none focus:border-ink font-mono"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase text-ink-secondary block mb-1">Reviewer</label>
          <CustomSelect
            value={selectedActor}
            onChange={(val) => setSelectedActor(val)}
            options={[
              { value: 'all', label: `All reviewers (${distinctActors.length})` },
              ...distinctActors.map((a) => ({ value: a, label: a })),
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase text-ink-secondary block mb-1">Action type</label>
          <CustomSelect
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            options={[
              { value: 'all', label: `All actions (${distinctTypes.length})` },
              ...distinctTypes.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>
      </div>

      {/* 3. Chronological Audit Ledger Table */}
      {isLoading ? (
        <div className="p-12 text-center border border-rule bg-surface rounded-xs font-mono text-xs text-ink-secondary">
          Loading review history...
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-critical/40 bg-surface rounded-xs space-y-2">
          <span className="text-xs font-mono text-critical block">{error}</span>
          <button
            onClick={loadAudit}
            className="px-3 py-1 bg-ink text-canvas text-xs font-medium rounded-xs"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div data-testid="audit-empty-state" className="p-12 text-center border border-dashed border-rule bg-surface/50 rounded-xs space-y-3">
          <div className="w-2.5 h-2.5 rounded-full bg-brass mx-auto" />
          <span className="font-editorial text-2xl text-ink font-medium block">
            No review history yet
          </span>
          <p className="text-xs font-sans text-ink-secondary max-w-md mx-auto leading-relaxed">
            Decisions and record comparisons will appear here in chronological order once records are reviewed.
          </p>
          <button
            onClick={loadAudit}
            className="mt-2 px-3.5 py-2 border border-rule bg-surface text-xs font-mono text-ink rounded-xs hover:bg-canvas transition-colors"
          >
            Refresh history
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center border border-rule bg-surface rounded-xs space-y-2">
          <span className="font-editorial text-xl text-ink font-medium block">
            No records match the filter
          </span>
          <p className="text-xs font-sans text-ink-secondary">
            Adjust search criteria or refresh to check for recent history.
          </p>
        </div>
      ) : (
        <div className="border border-rule bg-surface rounded-xs overflow-hidden shadow-subtle">
          <div className="p-4 border-b border-rule flex justify-between items-center bg-canvas/60 text-xs font-mono text-ink-secondary">
            <span>SAVED REVIEW HISTORY</span>
            <span>Displaying {filteredEvents.length} recorded events</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-rule bg-canvas/80 text-[11px] font-mono text-ink-secondary">
                <th className="py-2.5 px-4 font-normal">Action</th>
                <th className="py-2.5 px-4 font-normal">Who Decided</th>
                <th className="py-2.5 px-4 font-normal">Case Reference</th>
                <th className="py-2.5 px-4 font-normal">Status Change</th>
                <th className="py-2.5 px-4 font-normal text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 font-mono text-[11px]">
              {filteredEvents.map((evt) => {
                const isHuman = evt.event_type.startsWith('human_') || evt.actor !== 'system';
                const humanAction =
                  evt.event_type === 'human_review_submitted'
                    ? 'Review decision saved'
                    : evt.event_type === 'case_opened'
                    ? 'Case opened'
                    : evt.event_type === 'reconciliation_run'
                    ? 'Records compared'
                    : evt.event_type === 'batch_ingested'
                    ? 'File uploaded'
                    : evt.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                return (
                  <tr key={evt.id} className="h-[42px] hover:bg-canvas/40 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isHuman ? 'bg-ink' : 'bg-rule-strong'}`} />
                        <span className="font-semibold text-ink font-sans">
                          {humanAction}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap text-ink font-sans">
                      {evt.actor}
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      {evt.case_id ? (
                        <Link
                          to={`/app/case/${evt.case_id}`}
                          className="text-link hover:underline font-mono"
                          title="Open case"
                        >
                          {evt.case_id.slice(0, 10)}...
                        </Link>
                      ) : (
                        <span className="text-ink-muted">System Batch</span>
                      )}
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      {evt.previous_status && evt.new_status ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-ink-secondary">{evt.previous_status}</span>
                          <span className="text-ink-muted">&rarr;</span>
                          <span className="text-ledger-green font-semibold">{evt.new_status}</span>
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>

                    <td className="py-2 px-4 text-right whitespace-nowrap text-ink-secondary">
                      {new Date(evt.occurred_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
