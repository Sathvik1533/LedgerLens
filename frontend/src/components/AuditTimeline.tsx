import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { AuditEventItem } from '../types/api';

export const AuditTimeline: React.FC<{ events: AuditEventItem[] }> = ({ events }) => {
  return (
    <div className="bg-paper-1 border border-rule-300 rounded-md p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-rule-300 pb-2">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-source-blue" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wider font-sans">
            Audit Trail
          </h3>
        </div>
        <span className="text-[10px] font-mono text-ink-700 bg-paper-1 px-1.5 py-0.5 rounded border border-rule-300">
          {events.length} Event{events.length === 1 ? '' : 's'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-4 text-center text-xs text-ink-700 italic font-sans">No audit events recorded yet.</div>
      ) : (
        <div className="relative pl-4 space-y-2.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-paper-0/[0.1]">
          {events.map((evt) => {
            const isHuman = evt.event_type.startsWith('human_') || evt.actor !== 'system';
            let dateStr = evt.occurred_at;
            try {
              dateStr = new Date(evt.occurred_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
            } catch {
              // fallback
            }

            return (
              <div key={evt.id} className="relative">
                <span
                  className={`absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full ${
                    isHuman ? 'bg-source-blue' : 'bg-paper-1'
                  }`}
                  aria-hidden="true"
                />
                <div className="rounded bg-paper-0/80 border border-rule-300 p-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 font-medium text-ink-700 truncate">
                      {isHuman ? (
                        <UserCheck className="w-3 h-3 text-source-blue shrink-0" aria-hidden="true" />
                      ) : (
                        <Clock className="w-3 h-3 text-ink-700 shrink-0" aria-hidden="true" />
                      )}
                      <span className="font-mono text-[11px] text-blue-300 truncate">{evt.event_type}</span>
                    </div>
                    <span className="text-[10px] text-ink-700 font-mono shrink-0">{dateStr}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-ink-700 pt-0.5 font-mono">
                    <span>
                      Actor: <span className="text-ink-700">{evt.actor}</span>
                    </span>
                    {evt.previous_status && evt.new_status && (
                      <span className="text-ink-700">
                        <span>{evt.previous_status}</span>
                        <span className="text-ink-700 mx-1">&rarr;</span>
                        <span className="text-matched-green font-medium">{evt.new_status}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
