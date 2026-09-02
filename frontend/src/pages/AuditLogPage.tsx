import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Clock,
  RefreshCw,
  Search,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { fetchAllAuditTrail } from '../api/client';
import { AuditEventItem } from '../types/api';

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllAuditTrail(200, 0);
      setEvents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (selectedActor !== 'all' && e.actor !== selectedActor) return false;
    if (selectedType !== 'all' && e.event_type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (e.case_id && e.case_id.toLowerCase().includes(q)) ||
        (e.batch_id && e.batch_id.toLowerCase().includes(q)) ||
        e.actor.toLowerCase().includes(q) ||
        e.event_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActors = Array.from(new Set(events.map((e) => e.actor)));
  const uniqueTypes = Array.from(new Set(events.map((e) => e.event_type)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"
    >
      {/* 1. Section Header Strip */}
      <div className="space-y-2 border-b border-rule-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-source-blue bg-source-blue/10 border border-source-blue px-2.5 py-0.5 rounded-full">
            05 &mdash; IMMUTABLE COMPLIANCE LEDGER
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-xs text-ink-700 font-mono">APPEND-ONLY AUDIT LOG</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
              Audit Trail &amp; Compliance Ledger
            </h1>
            <p className="text-xs text-ink-700 font-sans mt-0.5">
              Append-only record of all state transitions, human reviewer actions, and deterministic batch executions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-1 border border-rule-300 text-xs text-ink-700 font-sans">
              <Lock className="w-3.5 h-3.5 text-source-blue" />
              <span>Cryptographic CAS</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadAudit}
              disabled={isLoading}
              className="h-8 px-3.5 rounded-full bg-paper-1 hover:bg-paper-1 border border-rule-300 text-xs font-medium text-ink-700 hover:text-ink-900 flex items-center gap-1.5 transition font-sans"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-source-blue' : ''}`} />
              <span>Refresh Audit</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="control-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-none text-xs font-sans">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-ink-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case UUID, Batch ID, or Actor..."
              className="w-full bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg pl-9 pr-3 py-2 text-xs text-ink-900 placeholder-[#829BB8]/50 focus:outline-none font-mono"
            />
          </div>

          {/* Actor Filter */}
          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg px-3 py-2 text-xs text-ink-900 focus:outline-none font-mono"
          >
            <option value="all" className="bg-paper-1">All Actors ({uniqueActors.length})</option>
            {uniqueActors.map((act) => (
              <option key={act} value={act} className="bg-paper-1">
                {act}
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg px-3 py-2 text-xs text-ink-900 focus:outline-none font-mono"
          >
            <option value="all" className="bg-paper-1">All Event Types ({uniqueTypes.length})</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t} className="bg-paper-1">
                {t}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-ink-700 font-mono">
          Showing {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* Audit Events Timeline */}
      <div className="control-panel rounded-xl p-6 shadow-none space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-ink-700">
            <RefreshCw className="w-5 h-5 text-source-blue animate-spin" />
            <span className="text-xs font-mono">Querying immutable audit logs...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-700 font-mono">
            No audit events found matching filters.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-paper-0/[0.1]">
            {filteredEvents.map((evt) => {
              const isHuman = evt.event_type.startsWith('human_') || evt.actor !== 'system';
              let dateStr = evt.occurred_at;
              try {
                dateStr = new Date(evt.occurred_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
              } catch {
                // fallback
              }

              return (
                <div key={evt.id} className="relative group">
                  <span
                    className={`absolute -left-[23px] top-2.5 w-2 h-2 rounded-full ring-4 ring-[#000000] ${
                      isHuman ? 'bg-source-blue shadow-none' : 'bg-paper-1'
                    }`}
                  />
                  <div className="bg-paper-1 hover:bg-paper-1 border border-rule-300 hover:border-source-blue rounded-lg p-4 space-y-2 transition shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isHuman ? (
                          <UserCheck className="w-3.5 h-3.5 text-source-blue shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-ink-700 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-bold text-ink-900">
                          {evt.event_type}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-paper-1 border border-rule-300 text-ink-700">
                          Actor: {evt.actor}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-ink-700">{dateStr}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ink-700 pt-1 border-t border-rule-300">
                      <div className="flex items-center gap-3">
                        {evt.case_id && (
                          <button
                            onClick={() => navigate(`/app/case/${evt.case_id}`)}
                            className="text-source-blue hover:text-blue-300 hover:underline flex items-center gap-1"
                          >
                            <span>Case: {evt.case_id.substring(0, 18)}...</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {evt.batch_id && <span>Batch: {evt.batch_id.substring(0, 12)}...</span>}
                      </div>

                      {evt.previous_status && evt.new_status && (
                        <div className="text-ink-900 flex items-center gap-1.5">
                          <span className="text-ink-700">{evt.previous_status}</span>
                          <span className="text-ink-700">&rarr;</span>
                          <span className="text-matched-green font-bold">{evt.new_status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
