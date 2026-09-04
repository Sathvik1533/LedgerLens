import React from 'react';
import { AuditEventItem } from '../types/api';

export const AuditTimeline: React.FC<{ events: AuditEventItem[] }> = ({ events }) => {
  return (
    <div className="border border-rule bg-surface p-4 rounded-xs space-y-3 font-sans shadow-subtle">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <span className="font-editorial text-base font-medium text-ink">
          Case audit ledger
        </span>
        <span className="text-[11px] font-mono text-ink-secondary bg-canvas px-1.5 py-0.5 rounded-xs border border-rule">
          {events.length} {events.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-4 text-center text-xs text-ink-secondary font-mono italic">
          No audit records appended yet.
        </div>
      ) : (
        <div className="divide-y divide-rule/60 text-xs">
          {events.map((evt) => {
            const isHuman = evt.event_type.startsWith('human_') || evt.actor !== 'system';
            let dateStr = evt.occurred_at;
            try {
              dateStr = new Date(evt.occurred_at).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'medium',
              });
            } catch {
              // fallback
            }

            return (
              <div key={evt.id} className="py-2.5 first:pt-1 last:pb-1 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isHuman ? 'bg-ink' : 'bg-rule-strong'}`} />
                    <span className="font-semibold text-ink">{evt.event_type}</span>
                  </div>
                  <span className="text-ink-secondary">{dateStr}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-ink-secondary">
                  <span>Signer: <strong className="text-ink font-normal">{evt.actor}</strong></span>
                  {evt.previous_status && evt.new_status && (
                    <span className="flex items-center gap-1">
                      <span>{evt.previous_status}</span>
                      <span className="text-ink-muted">&rarr;</span>
                      <span className="text-ledger-green font-medium">{evt.new_status}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
