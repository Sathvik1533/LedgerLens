import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, RefreshCw, GitCommit, User } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';
import { CustomSelect } from '../components/CustomSelect';
import { fetchAllAuditTrail } from '../api/client';
import { AuditEventItem } from '../types/api';


export const AuditLogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  

  const loadAudit = async () => {
    
    try {
      const data = await fetchAllAuditTrail(100);
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (searchQuery) result = result.filter(e => (e.case_id || "").includes(searchQuery) || (e.batch_id || "").includes(searchQuery));
    if (selectedActor !== 'all') result = result.filter(e => e.actor === selectedActor);
    if (selectedType !== 'all') result = result.filter(e => e.event_type === selectedType);
    return result;
  }, [searchQuery, selectedActor, selectedType]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full font-sans">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary border border-border px-2 py-0.5 rounded shadow-none bg-surface">05 &mdash; IMMUTABLE COMPLIANCE LEDGER</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-display tracking-tight text-text-primary">The Story of the Ledger</h1>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
            This is not just a technical dump. This is the cryptographic story of every decision made in LedgerLens. Every human approval and machine resolution is permanently recorded here to ensure strict regulatory compliance.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 bg-surface border border-border rounded text-xs font-mono text-text-secondary flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-resolved" /> Permanent Record
          </div>
          <button onClick={loadAudit} className="px-3 py-1.5 bg-surface border border-border rounded text-xs font-semibold text-text-primary shadow-none hover:bg-canvas transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-8 bg-surface p-4 rounded-xl border border-border shadow-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case UUID, Batch ID, or Actor..."
            className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder-ink-700/50 focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-source-blue/20 focus-visible:border-accent transition-all shadow-none font-mono"
          />
        </div>
        <div className="w-full md:w-48 shrink-0">
          <CustomSelect
            value={selectedActor}
            onChange={setSelectedActor}
            options={[
              { value: 'all', label: 'All Actors' },
              { value: 'concurrent_reviewer_bob', label: 'Reviewer Bob' },
              { value: 'concurrent_analyst_02', label: 'Analyst 02' }
            ]}
          />
        </div>
        <div className="w-full md:w-48 shrink-0">
          <CustomSelect
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { value: 'all', label: 'All Event Types' },
              { value: 'human_rejected', label: 'Human Rejected' },
              { value: 'system_resolved', label: 'System Resolved' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-rule-300 before:via-rule-300 before:to-transparent">
        <AnimatePresence>
          {filteredEvents.map((evt) => (
            <motion.div key={evt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-start gap-6 group">
              <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center z-10 group-hover:border-accent transition-colors shadow-none shrink-0 mt-1">
                <GitCommit className="w-4 h-4 text-text-secondary group-hover:text-accent" />
              </div>
              <div className="flex-1 bg-surface border border-border rounded-xl p-5 shadow-none group-hover:shadow-none transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tooltip content="The system event type recorded in the database.">
                      <span tabIndex={0} className="font-mono text-xs font-semibold text-critical focus-ring">{evt.event_type}</span>
                    </Tooltip>
                    <span className="text-rule-300">|</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-border"><User className="w-3 h-3" /> {evt.actor}</span>
                  </div>
                  <span className="font-mono text-[10px] text-text-secondary">{new Date(evt.occurred_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                  {evt.case_id && <span>Case: <span className="text-text-primary">{evt.case_id.substring(0,8)}</span></span>}
                  {evt.case_id && evt.batch_id && <span className="text-rule-300">&rarr;</span>}
                  {evt.batch_id && <span>Batch: <span className="text-text-primary">{evt.batch_id.substring(0,8)}</span></span>}
                  <div className="flex-1" />
                  {evt.previous_status && <span className="text-high font-semibold">{evt.previous_status}</span>}
                  {evt.previous_status && evt.new_status && <span className="text-rule-300">&rarr;</span>}
                  {evt.new_status && <span className="text-critical font-semibold">{evt.new_status}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
