import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { AuditEventItem } from '../types/api';

export const AuditTimeline: React.FC<{ events: AuditEventItem[] }> = ({ events }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <History className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Append-Only Audit Trail ({events.length} Event{events.length === 1 ? '' : 's'})
        </h3>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">No audit events recorded yet.</p>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt) => {
            const isHuman = evt.event_type.startsWith('human_');
            const dateStr = new Date(evt.occurred_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div key={evt.id} className="relative group">
                <span
                  className={`absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    isHuman ? 'bg-blue-400' : 'bg-slate-500'
                  }`}
                />
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      {isHuman ? <UserCheck className="w-3.5 h-3.5 text-blue-400" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="font-mono text-blue-300">{evt.event_type}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Actor: <span className="text-slate-300 font-mono">{evt.actor}</span></span>
                    {evt.previous_status && evt.new_status && (
                      <span className="text-[11px]">
                        <span className="text-slate-400">{evt.previous_status}</span> &rarr;{' '}
                        <span className="text-emerald-400 font-medium">{evt.new_status}</span>
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
