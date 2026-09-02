import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
    Copy,
  Check,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { ReviewQueueItem } from '../../types/api';
import { fetchReviewQueue } from '../../api/client';
import { AmountDisplay } from '../../components/AmountDisplay';
import { ExceptionBadge } from '../../components/ExceptionBadge';
import { QueueTableSkeleton } from '../../components/SkeletonLoaders';
import { EmptyState } from '../../components/EmptyState';

// Helper for human-readable summaries
const getPlainLanguageSummary = (item: ReviewQueueItem) => {
  switch (item.exception_type) {
    case 'amount_mismatch': return "Amount mismatch between gateway settlement and internal capture.";
    case 'fee_mismatch': return "Gateway deducted incorrect MDR fee or GST tax rate.";
    case 'missing_settlement': return "Payment captured but settlement record was never received.";
    case 'missing_bank_credit': return "Settlement received but expected bank credit is missing.";
    case 'duplicate_payment': return "Multiple payment captures share the exact same reference.";
    case 'duplicate_bank_credit': return "Multiple bank statement credits reference the same batch ID.";
    case 'partial_refund_not_reflected': return "Refund was processed but settlement payout was not adjusted.";
    case 'ambiguous_match': return "Multiple candidate records matched transaction criteria.";
    default: return "Manual investigation required for financial discrepancy.";
  }
};

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

  // Filters
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

  const handleRowClick = (caseId: string) => {
    navigate(`/app/case/${caseId}`);
  };

  // Filter & Sort Logic
  const processedCases = useMemo(() => {
    let result = [...cases];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.payment_id.toLowerCase().includes(q) || 
        c.case_id.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(c => c.exception_type === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      result = result.filter(c => {
        const sev = getSeverity(c).label.toLowerCase();
        return sev === selectedSeverity;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'amount') return (parseFloat(b.amount_at_risk || '0') - parseFloat(a.amount_at_risk || '0'));
      if (sortBy === 'age') return new Date(a.case_opened_at).getTime() - new Date(b.case_opened_at).getTime();
      return (parseFloat(b.amount_at_risk || '0') - parseFloat(a.amount_at_risk || '0')); 
    });

    return result;
  }, [cases, searchQuery, selectedCategory, selectedSeverity, sortBy]);

  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + parseFloat(item.amount_at_risk || '0'), 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-10 bg-paper-0 min-h-screen"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-rule-300">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-700 border border-rule-300 px-2 py-0.5 rounded shadow-sm bg-white">
                02 &mdash; OPERATIONAL EXCEPTION QUEUE
              </span>
              <span className="text-ink-700">&bull;</span>
              <span className="text-[10px] font-mono text-ink-700 uppercase tracking-widest">
                HUMAN-IN-THE-LOOP TRIAGE
              </span>
            </div>
            <h1 className="text-4xl font-semibold font-display tracking-tight text-ink-900">
              Exception Control Room
            </h1>
            <p className="text-sm text-ink-700 mt-2 font-sans max-w-2xl leading-relaxed">
              {processedCases.length} anomalies flagged by the deterministic engine requiring human review. Select a case below to inspect source evidence and enforce ledger policy.
            </p>
          </div>
          
          <div className="flex flex-col items-end bg-white px-5 py-4 border border-rule-300 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-ink-700 uppercase tracking-widest mb-1">Total Exposure</span>
            <span className="text-2xl font-mono font-medium text-ledger-vermilion">₹{totalAmountAtRisk}</span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 border border-rule-300 rounded-lg shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-700" />
            <input
              type="text"
              placeholder="Search by Payment ID or Case UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper-0 border border-rule-300 rounded-md pl-9 pr-3 py-2 text-sm text-ink-900 placeholder-ink-700 focus:outline-none focus:border-ink-900 transition-colors font-mono"
            />
          </div>

          {/* Type Filter */}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 transition-colors font-sans"
          >
            <option value="discrepancy">Sort: High Risk</option>
            <option value="amount">Sort: Amount</option>
            <option value="age">Sort: Age</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 transition-colors font-sans"
          >
            <option value="all">All Exception Categories</option>
            <option value="amount_mismatch">Amount Mismatch</option>
            <option value="fee_mismatch">Fee &amp; Tax Mismatch</option>
            <option value="missing_settlement">Missing Settlement</option>
            <option value="missing_bank_credit">Missing Bank Credit</option>
            <option value="duplicate_payment">Duplicate Payment</option>
            <option value="duplicate_bank_credit">Duplicate Credit</option>
            <option value="partial_refund_not_reflected">Unadjusted Refund</option>
            <option value="ambiguous_match">Ambiguous Match</option>
          </select>

          {/* Severity Segments */}
          <div className="flex bg-paper-0 border border-rule-300 rounded-md p-0.5">
            {['all', 'critical', 'high'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-4 py-1.5 text-xs font-semibold rounded capitalize transition-all ${
                  selectedSeverity === sev 
                    ? 'bg-ink-900 text-white shadow-sm' 
                    : 'text-ink-700 hover:text-ink-900 hover:bg-paper-1'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-ledger-vermilion/10 border border-ledger-vermilion rounded-lg p-4 flex items-center justify-between text-ink-900 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-ledger-vermilion" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={loadQueue}
              className="px-4 py-2 bg-white border border-ledger-vermilion text-ledger-vermilion rounded text-xs font-semibold shadow-sm hover:bg-paper-0 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Main Queue Table */}
        {isLoading ? (
          <QueueTableSkeleton rows={6} />
        ) : cases.length === 0 ? (
          <EmptyState
            type="empty_queue"
            actionLabel="Refresh Live Feed"
            onAction={loadQueue}
          />
        ) : processedCases.length === 0 ? (
          <EmptyState
            type="filtered_empty"
            actionLabel="Reset Active Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSeverity('all');
            }}
          />
        ) : (
          <div className="bg-white border border-rule-300 rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-0 border-b border-rule-300">
                    <th className="py-4 px-6 w-32 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Severity</th>
                    <th className="py-4 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest">What Happened &amp; Identifiers</th>
                    <th className="py-4 px-6 text-right w-48 text-[10px] font-mono text-ink-700 uppercase tracking-widest">At Risk</th>
                    <th className="py-4 px-6 text-right w-32 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Action</th>
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
                          onClick={() => handleRowClick(item.case_id)}
                          className="hover:bg-paper-0 border-l-2 border-transparent hover:border-l-ink-900 transition-all cursor-pointer group"
                        >
                          {/* Severity */}
                          <td className="py-5 px-6 align-top">
                            <span className="inline-flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shadow-sm ${isCrit ? 'bg-ledger-vermilion' : 'bg-advisory-amber'}`} />
                              <span className={`text-xs font-semibold ${isCrit ? 'text-ledger-vermilion' : 'text-advisory-amber'}`}>
                                {isCrit ? 'Critical' : 'High'}
                              </span>
                            </span>
                          </td>

                          {/* Story & Identifiers */}
                          <td className="py-5 px-6 align-top space-y-2">
                            <p className="text-sm font-semibold text-ink-900 leading-snug group-hover:text-source-blue transition-colors">
                              {getPlainLanguageSummary(item)}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-ink-700">
                              <button
                                onClick={(e) => copyToClipboard(item.payment_id, e)}
                                className="inline-flex items-center gap-1.5 bg-paper-0 border border-rule-300 px-2 py-0.5 rounded shadow-sm hover:bg-paper-1 hover:text-ink-900 transition-colors"
                              >
                                <span>{item.payment_id}</span>
                                {copiedId === item.payment_id ? <Check className="w-3 h-3 text-matched-green" /> : <Copy className="w-3 h-3 opacity-60" />}
                              </button>
                              <span className="opacity-50">&bull;</span>
                              <span className="opacity-80 text-[10px]">{item.case_id}</span>
                              <span className="opacity-50">&bull;</span>
                              <ExceptionBadge type={item.exception_type} size="sm" />
                            </div>
                          </td>

                          {/* Risk Amount */}
                          <td className="py-5 px-6 align-top text-right">
                            <AmountDisplay amount={item.amount_at_risk} className="text-ink-900 font-mono font-medium text-sm" />
                          </td>

                          {/* Action */}
                          <td className="py-5 px-6 align-top text-right">
                            <span className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-rule-300 text-ink-900 text-xs font-semibold rounded-md shadow-sm group-hover:bg-ink-900 group-hover:text-white group-hover:border-ink-900 transition-all">
                              <span>Inspect</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1.5 transition-all" />
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            <div className="bg-paper-0 border-t border-rule-300 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-ink-700 font-sans">Showing {processedCases.length} of {cases.length} records</span>
              <span className="text-[10px] text-ink-700 font-mono uppercase tracking-widest">Deterministic 3-Stage Parity Engine</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QueuePage;
