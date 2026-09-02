import os

audit_path = 'frontend/src/pages/AuditLogPage.tsx'
with open(audit_path, 'r') as f:
    audit_c = f.read()

# Replace mockAuditEvents with dynamic fetch
audit_c = audit_c.replace("import React, { useState, useMemo }", "import { useState, useMemo, useEffect }")
audit_c = audit_c.replace("import { CustomSelect } from '../components/CustomSelect';", "import { CustomSelect } from '../components/CustomSelect';\nimport { fetchAllAuditTrail } from '../api/client';\nimport { AuditEventItem } from '../types/api';")

mock_events_str = """const mockAuditEvents = [
  { id: 'evt_1', timestamp: '2026-08-31T19:22:51Z', actor: 'concurrent_reviewer_bob', type: 'human_rejected', case_id: 'ab9a5b51', batch_id: '0a4830c6', prev: 'needs_review', next: 'rejected' },
  { id: 'evt_2', timestamp: '2026-08-31T19:10:30Z', actor: 'concurrent_reviewer_bob', type: 'human_rejected', case_id: '9c92804a', batch_id: '0a4830c6', prev: 'needs_review', next: 'rejected' },
  { id: 'evt_3', timestamp: '2026-08-31T19:08:30Z', actor: 'concurrent_reviewer_bob', type: 'human_rejected', case_id: '3656d3a3', batch_id: '0a4830c6', prev: 'needs_review', next: 'rejected' },
  { id: 'evt_4', timestamp: '2026-08-31T17:34:33Z', actor: 'concurrent_analyst_02', type: 'human_rejected', case_id: 'ffbe97e2', batch_id: '0a4830c6', prev: 'needs_review', next: 'rejected' },
];"""

audit_c = audit_c.replace(mock_events_str, "const MOCK_FALLBACK: AuditEventItem[] = [];")

state_replace = """  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');"""

new_state = """  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAuditTrail(100);
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);"""

audit_c = audit_c.replace(state_replace, new_state)

audit_c = audit_c.replace("let result = mockAuditEvents;", "let result = events;")
audit_c = audit_c.replace("type: 'human_rejected'", "type: 'human_review'")

# Fix rendering mapping
old_map = """<motion.div key={evt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-start gap-6 group">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-rule-300 flex items-center justify-center z-10 group-hover:border-source-blue transition-colors shadow-sm shrink-0 mt-1">
                <GitCommit className="w-4 h-4 text-ink-700 group-hover:text-source-blue" />
              </div>
              <div className="flex-1 bg-white border border-rule-300 rounded-xl p-5 shadow-sm group-hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ledger-vermilion">{evt.type}</span>
                    <span className="text-rule-300">|</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 bg-paper-1 px-2 py-0.5 rounded-full border border-rule-300"><User className="w-3 h-3" /> {evt.actor}</span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-700">{evt.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-ink-700">
                  <span>Case: <span className="text-ink-900">{evt.case_id}</span></span>
                  <span className="text-rule-300">&rarr;</span>
                  <span>Batch: <span className="text-ink-900">{evt.batch_id}</span></span>
                  <div className="flex-1" />
                  <span className="text-advisory-amber font-semibold">{evt.prev}</span>
                  <span className="text-rule-300">&rarr;</span>
                  <span className="text-ledger-vermilion font-semibold">{evt.next}</span>
                </div>
              </div>
            </motion.div>"""

new_map = """<motion.div key={evt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-start gap-6 group">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-rule-300 flex items-center justify-center z-10 group-hover:border-source-blue transition-colors shadow-sm shrink-0 mt-1">
                <GitCommit className="w-4 h-4 text-ink-700 group-hover:text-source-blue" />
              </div>
              <div className="flex-1 bg-white border border-rule-300 rounded-xl p-5 shadow-sm group-hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ledger-vermilion">{evt.event_type}</span>
                    <span className="text-rule-300">|</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 bg-paper-1 px-2 py-0.5 rounded-full border border-rule-300"><User className="w-3 h-3" /> {evt.actor}</span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-700">{new Date(evt.occurred_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-ink-700">
                  {evt.case_id && <span>Case: <span className="text-ink-900">{evt.case_id.substring(0,8)}</span></span>}
                  {evt.case_id && evt.batch_id && <span className="text-rule-300">&rarr;</span>}
                  {evt.batch_id && <span>Batch: <span className="text-ink-900">{evt.batch_id.substring(0,8)}</span></span>}
                  <div className="flex-1" />
                  {evt.previous_status && <span className="text-advisory-amber font-semibold">{evt.previous_status}</span>}
                  {evt.previous_status && evt.new_status && <span className="text-rule-300">&rarr;</span>}
                  {evt.new_status && <span className="text-ledger-vermilion font-semibold">{evt.new_status}</span>}
                </div>
              </div>
            </motion.div>"""

audit_c = audit_c.replace(old_map, new_map)
audit_c = audit_c.replace('onClick={() => {}}', 'onClick={loadAudit}')
audit_c = audit_c.replace('<button className="px-3', '<button onClick={loadAudit} className="px-3')

with open(audit_path, 'w') as f:
    f.write(audit_c)
