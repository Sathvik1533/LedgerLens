import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { AuditEventItem } from '../types/api';

export const AuditTimeline: React.FC<{ events: AuditEventItem[] }> = ({ events }) => {
  return (
    <div className="bg-surface border border-border-strong rounded-xl p-5 space-y-4 shadow-panel">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Trail
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
          {events.length} Event{events.length === 1 ? '' : 's'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 italic">No audit events recorded yet.</div>
      ) : (
        <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-strong">
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
              // fallback to raw
            }

            return (
              <div key={evt.id} className="relative">
                <span
                  className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-surface ${
                    isHuman ? 'bg-blue-500' : 'bg-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <div className="rounded-lg bg-surface-alt border border-border-subtle p-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 font-semibold text-slate-200 truncate">
                      {isHuman ? (
                        <UserCheck className="w-3 h-3 text-blue-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      )}
                      <span className="font-mono text-[11px] text-blue-300 truncate">{evt.event_type}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{dateStr}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-0.5">
                    <span>
                      Actor: <span className="text-slate-300 font-mono">{evt.actor}</span>
                    </span>
                    {evt.previous_status && evt.new_status && (
                      <span className="font-mono text-slate-300">
                        <span>{evt.previous_status}</span>
                        <span className="text-slate-500 mx-1">&rarr;</span>
                        <span className="text-emerald-400 font-bold">{evt.new_status}</span>
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
