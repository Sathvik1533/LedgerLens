import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { AuditEventItem } from '../types/api';

export const AuditTimeline: React.FC<{ events: AuditEventItem[] }> = ({ events }) => {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 space-y-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <History className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Append-Only Audit Trail
          </h3>
          <p className="text-[11px] text-slate-400">Immutable ledger log ({events.length} Event{events.length === 1 ? '' : 's'})</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 italic">No audit events recorded yet.</div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt) => {
            const isHuman = evt.event_type.startsWith('human_');
            const dateStr = new Date(evt.occurred_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div key={evt.id} className="relative group">
                <span
                  className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm flex items-center justify-center ${
                    isHuman ? 'bg-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-600'
                  }`}
                />
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-1.5 text-xs hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      {isHuman ? (
                        <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-mono text-blue-300">{evt.event_type}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                    <span>
                      Actor: <span className="text-slate-300 font-mono font-medium">{evt.actor}</span>
                    </span>
                    {evt.previous_status && evt.new_status && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <span className="text-slate-500">{evt.previous_status}</span>
                        <span className="text-slate-600">&rarr;</span>
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
