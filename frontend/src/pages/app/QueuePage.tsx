import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { ReviewQueueItem } from '../../types/api';
import { fetchReviewQueue } from '../../api/client';
import { AmountDisplay } from '../../components/AmountDisplay';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { ExceptionBadge, EXCEPTION_CONFIG } from '../../components/ExceptionBadge';
import { Tooltip } from '../../components/Tooltip';
import { QueueTableSkeleton } from '../../components/SkeletonLoaders';
import { EmptyState } from '../../components/EmptyState';
import { CustomSelect } from '../../components/CustomSelect';

;

const getSeverity = (item: ReviewQueueItem) => {
  if (item.exception_type === 'amount_mismatch' || item.exception_type === 'missing_bank_credit') {
    return { label: 'Critical', color: 'ledger-vermilion' };
  }
  return { label: 'High', color: 'advisory-amber' };
};

const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discrepancy' | 'amount' | 'age'>('discrepancy');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue();
      setCases(data.cases || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to reconciliation engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processedCases = useMemo(() => {
    let result = [...cases];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.payment_id.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.exception_type === selectedCategory);
    }
    if (selectedSeverity !== 'all') {
      result = result.filter(c => getSeverity(c).label.toLowerCase() === selectedSeverity);
    }
    result.sort((a, b) => {
      if (sortBy === 'amount') return parseFloat(b.amount_at_risk || '0') - parseFloat(a.amount_at_risk || '0');
      if (sortBy === 'age') return new Date(a.case_opened_at).getTime() - new Date(b.case_opened_at).getTime();
      return parseFloat(b.amount_at_risk || '0') - parseFloat(a.amount_at_risk || '0'); 
    });
    return result;
  }, [cases, searchQuery, selectedCategory, selectedSeverity, sortBy]);

  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + parseFloat(item.amount_at_risk || '0'), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 font-sans"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-700 border border-rule-300 px-2 py-0.5 rounded shadow-none bg-white">
          02 &mdash; OPERATIONAL EXCEPTION QUEUE
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-rule-300">
        <div>
          <h1 className="text-4xl font-semibold font-display tracking-tight text-ink-900">
            Exception Control Room
          </h1>
          <p className="text-sm text-ink-700 mt-2 max-w-2xl leading-relaxed">
            {processedCases.length} anomalies flagged by the deterministic engine requiring human review. Select a case below to inspect source evidence and enforce ledger policy.
          </p>
        </div>
        <div className="flex flex-col items-end bg-white px-5 py-4 border border-rule-300 rounded-lg shadow-none">
          <span className="text-[10px] font-mono text-ink-700 uppercase tracking-widest mb-1">Total Exposure</span>
          <div className="text-2xl font-mono font-medium text-ledger-vermilion flex items-center">
            ₹<AnimatedCounter value={totalAmountAtRisk} />.00
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-ledger-vermilion/10 border border-ledger-vermilion rounded-lg p-4 flex items-center justify-between text-ink-900 shadow-none">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-ledger-vermilion" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Tooltip content="Refresh the queue data from the server">
          <button onClick={loadQueue} className="px-4 py-2 bg-white border border-ledger-vermilion text-ledger-vermilion rounded text-xs font-semibold shadow-none hover:bg-paper-0 transition-colors flex items-center gap-2 focus-ring">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
          </Tooltip>
        </div>
      )}

      {/* Envato-style 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar: Advanced Filtering (Sticky) */}
        <div className="w-full lg:w-64 shrink-0 bg-white border border-rule-300 rounded-xl p-5 shadow-none sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain" data-lenis-prevent="true">
          <div className="flex items-center gap-2 mb-6 text-ink-900 font-semibold border-b border-rule-300 pb-3">
            <Filter className="w-4 h-4" />
            <span className="font-display">Refine Queue</span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-mono text-ink-700 uppercase tracking-widest block mb-2">Search ID</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-700" />
                <input
                  type="text"
                  placeholder="Payment or Case ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-paper-0 border border-rule-300 rounded-md pl-9 pr-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900/20 focus-visible:border-ink-900 transition-all transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-ink-700 uppercase tracking-widest block mb-3">Severity Level</label>
              <div className="space-y-2">
                {['all', 'critical', 'high'].map(sev => (
                  <label key={sev} className="flex items-center gap-3 cursor-pointer group focus-ring">
                    <input type="radio" name="severity" value={sev} checked={selectedSeverity === sev} onChange={() => setSelectedSeverity(sev)} className="hidden" />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSeverity === sev ? 'bg-ink-900 border-ink-900' : 'bg-paper-0 border-rule-300 group-hover:border-ink-900'}`}>
                      {selectedSeverity === sev && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm text-ink-900 capitalize">{sev === 'all' ? 'Any Severity' : sev}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-ink-700 uppercase tracking-widest block mb-3">Exception Category</label>
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'amount_mismatch', label: 'Amount Mismatch' },
                  { value: 'fee_mismatch', label: 'Fee & Tax Mismatch' },
                  { value: 'missing_settlement', label: 'Missing Settlement' },
                  { value: 'missing_bank_credit', label: 'Missing Bank Credit' },
                  { value: 'duplicate_payment', label: 'Duplicate Payment' },
                  { value: 'partial_refund_not_reflected', label: 'Unadjusted Refund' },
                ]}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-ink-700 uppercase tracking-widest block mb-3">Sort Priority</label>
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={[
                  { value: 'discrepancy', label: 'High Risk First' },
                  { value: 'amount', label: 'Amount (High to Low)' },
                  { value: 'age', label: 'Age (Oldest First)' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Main Data Table */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <QueueTableSkeleton rows={6} />
          ) : cases.length === 0 ? (
            <EmptyState type="empty_queue" actionLabel="Refresh Live Feed" onAction={loadQueue} />
          ) : processedCases.length === 0 ? (
            <EmptyState type="filtered_empty" actionLabel="Reset Active Filters" onAction={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedSeverity('all'); }} />
          ) : (
            <div className="bg-white border border-rule-300 rounded-xl shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-0 border-b border-rule-300">
                      <th className="py-3 px-5 w-28 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Level</th>
                      <th className="py-3 px-5 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Discrepancy Signature</th>
                      <th className="py-3 px-5 text-right w-40 text-[10px] font-mono text-ink-700 uppercase tracking-widest">At Risk</th>
                      <th className="py-3 px-5 text-right w-24 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule-300 text-sm">
                    <AnimatePresence initial={false}>
                      {processedCases.map((item) => {
                        const severity = getSeverity(item);
                        const isCrit = severity.label.toLowerCase() === 'critical';
                        
                        return (
                          <motion.tr
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            key={item.case_id}
                            onClick={() => navigate(`/app/case/${item.case_id}`)}
                            className={`hover:bg-paper-0 border-l-2 border-transparent hover:border-l-ink-900 transition-all cursor-pointer group ${isCrit ? "border-beam" : ""}`}
                          >
                            <td className="py-4 px-5 align-top">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full shadow-none ${isCrit ? 'bg-ledger-vermilion' : 'bg-advisory-amber'}`} />
                                <span className={`text-xs font-semibold ${isCrit ? 'text-ledger-vermilion' : 'text-advisory-amber'}`}>
                                  {severity.label}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 px-5 align-top space-y-1.5">
                              <p className="text-sm font-semibold text-ink-900 leading-snug group-hover:text-source-blue transition-colors">
                                {(item.exception_type && EXCEPTION_CONFIG[item.exception_type]) ? EXCEPTION_CONFIG[item.exception_type].explanation : 'Manual investigation required for financial discrepancy.'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-ink-700">
                                <Tooltip content="Copy Payment ID to clipboard">
                                <button
                                  onClick={(e) => copyToClipboard(item.payment_id, e)}
                                  className="inline-flex items-center gap-1 bg-paper-0 border border-rule-300 px-1.5 py-0.5 rounded shadow-none hover:bg-paper-1 hover:text-ink-900 transition-colors focus-ring"
                                  aria-label={`Copy payment ID ${item.payment_id}`}
                                >
                                  <span>{item.payment_id}</span>
                                  {copiedId === item.payment_id ? <Check className="w-2.5 h-2.5 text-matched-green" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                                </button>
                                </Tooltip>
                                <span className="opacity-50">&bull;</span>
                                <ExceptionBadge type={item.exception_type} size="sm" />
                              </div>
                            </td>
                            <td className="py-4 px-5 align-top text-right">
                              <AmountDisplay amount={item.amount_at_risk} className="text-ink-900 font-mono font-medium text-sm" />
                            </td>
                            <td className="py-4 px-5 align-top text-right">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-rule-300 group-hover:bg-ink-900 group-hover:border-ink-900 group-hover:text-white transition-all text-ink-700">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default QueuePage;
