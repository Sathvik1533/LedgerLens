import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Database,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Shield,
  CreditCard,
  RefreshCcw,
  Landmark,
} from 'lucide-react';
import { fetchIngestionStatus, uploadFeedCsv } from '../api/client';
import { IngestionStatusResponse } from '../types/api';

const FEEDS = [
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'settlements', label: 'Settlements', icon: Landmark },
  { id: 'refunds', label: 'Refunds', icon: RefreshCcw },
  { id: 'bank-credits', label: 'Bank Credits', icon: Database },
];

export const IngestionFeedsPage: React.FC = () => {
  const [selectedFeed, setSelectedFeed] = React.useState<'payments' | 'settlements' | 'refunds' | 'bank-credits'>('payments');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [statusData, setStatusData] = useState<IngestionStatusResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchIngestionStatus();
      setStatusData(data);
    } catch (err) {}
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);
    setUploadError(null);

    try {
      const result = await uploadFeedCsv(selectedFeed, file, idempotencyKey || undefined);
      setUploadResult(result);
      setFile(null);
      setIdempotencyKey('');
      loadStatus();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed due to an unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-10 bg-paper-0 min-h-screen"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-rule-300">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-700 border border-rule-300 px-2 py-0.5 rounded shadow-none bg-white">
                04 &mdash; MULTI-SOURCE INGESTION ENGINE
              </span>
              <span className="text-ink-700">&bull;</span>
              <span className="text-[10px] font-mono text-ink-700 uppercase tracking-widest">
                ACID IDEMPOTENT INGESTION
              </span>
            </div>
            <h1 className="text-3xl font-semibold font-display tracking-tight text-ink-900">
              Data Feeds &amp; Ingestion Hub
            </h1>
            <p className="text-sm text-ink-700 mt-2 font-sans max-w-xl leading-relaxed">
              Manage multi-source feeds, upload synthetic batch records, and verify uploading behavior safely without corrupting the active ledger.
            </p>
          </div>
          <div>
            <button
              onClick={loadStatus}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-paper-1 border border-rule-300 text-ink-900 rounded-md text-xs font-semibold shadow-none transition active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger State</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Upload Form Card */}
          <div className="lg:col-span-2 bg-white border border-rule-300 rounded-xl p-8 shadow-none">
            <div className="flex items-center justify-between border-b border-rule-300 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-source-blue" />
                <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-widest font-mono">
                  Upload &amp; Ingest Synthetic Batch
                </h2>
              </div>
              <span className="text-[10px] bg-matched-green/10 text-matched-green border border-matched-green px-2 py-0.5 rounded-full font-mono uppercase">
                Schema Enforced
              </span>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* Feed Selection Tabs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink-900">
                  Select Target Feed Line
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FEEDS.map((feed) => {
                    const Icon = feed.icon;
                    const isActive = selectedFeed === feed.id;
                    return (
                      <button
                        key={feed.id}
                        type="button"
                        onClick={() => setSelectedFeed(feed.id as any)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-ink-900 border-ink-900 text-white shadow-none'
                            : 'bg-white border-rule-300 text-ink-700 hover:bg-paper-0 hover:border-ink-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'opacity-70'}`} />
                        <span className="text-xs font-semibold">{feed.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Idempotency Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="idempotency" className="block text-xs font-semibold text-ink-900">
                    Duplicate Prevention Key (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-ink-700">(Batch ID)</span>
                </div>
                <input
                  id="idempotency"
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  placeholder="e.g. batch-upload-2026-08-31-01"
                  className="w-full bg-white border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 placeholder-ink-700/40 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all font-mono"
                />
              </div>

              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink-900">
                  Attach .CSV File
                </label>
                <div className="relative group">
                  <div className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-all ${
                    file ? 'bg-source-blue/5 border-source-blue' : 'bg-paper-0 border-rule-300 group-hover:border-ink-700 group-hover:bg-paper-1'
                  }`}>
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-2 text-center pointer-events-none">
                      <FileCheck className={`w-8 h-8 mx-auto ${file ? 'text-source-blue' : 'text-ink-700 opacity-60'}`} />
                      <div className="text-sm text-ink-900 font-semibold">
                        {file ? file.name : 'Drag & drop your CSV file here or click to browse'}
                      </div>
                      <div className="text-xs font-mono text-ink-700">
                        {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard UTF-8 RFC 4180 CSV'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Feedback Alerts */}
              {uploadResult && (
                <div className="p-4 rounded-md bg-matched-green/10 border border-matched-green text-sm text-matched-green flex items-start gap-3 shadow-none">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">Batch Ingested Successfully</span>
                    <span className="font-mono text-xs opacity-90 block">
                      Accepted: {uploadResult.row_count_accepted} • Rejected: {uploadResult.row_count_rejected}
                    </span>
                    <span className="font-mono text-[10px] opacity-80 mt-1 block">ID: {uploadResult.batch_id}</span>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-4 rounded-md bg-ledger-vermilion/10 border border-ledger-vermilion text-sm text-ink-900 flex items-start gap-3 shadow-none">
                  <AlertCircle className="w-5 h-5 text-ledger-vermilion shrink-0 mt-0.5" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full h-11 rounded-md bg-ink-900 text-white font-semibold text-sm transition-all disabled:opacity-50 hover:bg-ink-700 active:scale-[0.99] flex items-center justify-center gap-2 shadow-none"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Validating schema...</span>
                  </>
                ) : (
                  <>
                    <span>Ingest {selectedFeed.replace('-', ' ').toUpperCase()} Batch</span>
                    <span className="font-mono text-[10px] opacity-70 ml-2 border border-white/30 px-1.5 py-0.5 rounded">RETURN</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Educational Sidebar Card */}
          <div className="bg-white border border-rule-300 rounded-xl p-6 shadow-none h-fit space-y-6">
            <div className="flex items-center gap-2 border-b border-rule-300 pb-4">
              <Shield className="w-4 h-4 text-ink-900" />
              <h2 className="text-xs font-bold text-ink-900 uppercase tracking-widest font-mono">
                Data Protections
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-paper-0 border border-rule-300">
                <h3 className="font-semibold text-ink-900 text-xs mb-1">Exact Replay Guard</h3>
                <p className="text-xs text-ink-700 leading-relaxed">
                  Submitting a duplicate batch payload or key returns the existing batch metadata immediately without mutating the underlying tables or duplicating active cases.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-paper-0 border border-rule-300">
                <h3 className="font-semibold text-ink-900 text-xs mb-1">Strict Currency Precision</h3>
                <p className="text-xs text-ink-700 leading-relaxed">
                  All monetary amounts are validated for strictly scale=2 decimal precision. Invalid row formats block their specific transaction while allowing clean records to proceed.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-paper-0 border border-rule-300">
                <h3 className="font-semibold text-ink-900 text-xs mb-1">Permanent Audit Trail</h3>
                <p className="text-xs text-ink-700 leading-relaxed">
                  Every uploaded row is permanently recorded with a timestamp, ensuring clear visibility into who uploaded what data and when.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        {statusData && statusData.batches.length > 0 && (
          <div className="bg-white border border-rule-300 rounded-xl shadow-none overflow-hidden mt-8">
            <div className="p-6 border-b border-rule-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-ink-900" />
                <h2 className="text-xs font-bold text-ink-900 uppercase tracking-widest font-mono">
                  Recent Ingestion Batches
                </h2>
              </div>
              <span className="text-[10px] bg-paper-1 text-ink-700 px-2 py-0.5 rounded font-mono border border-rule-300">
                {statusData.batches.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-paper-0 border-b border-rule-300">
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Batch Key</th>
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Source Table</th>
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest text-right">Submitted</th>
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest text-right">Accepted</th>
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest text-center">Status</th>
                    <th className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-300 font-mono text-xs">
                  {statusData.batches.map((b: any) => (
                    <tr key={b.id} className="hover:bg-paper-1/50 transition-colors">
                      <td className="py-4 px-6">
                        <button
                          onClick={() => copyText(b.idempotency_key, b.id)}
                          className="text-ink-900 hover:text-source-blue flex items-center gap-2 group transition-colors"
                          title={b.idempotency_key}
                        >
                          <span className="truncate max-w-[200px]">{b.idempotency_key}</span>
                          {copiedKey === b.id ? (
                            <Check className="w-3 h-3 text-matched-green" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-ink-700 capitalize">
                        {b.source_tables?.join(', ') || 'Manual Sync'}
                      </td>
                      <td className="py-4 px-6 text-right text-ink-900 font-medium">
                        {b.row_count_submitted}
                      </td>
                      <td className="py-4 px-6 text-right text-matched-green font-medium">
                        {b.row_count_accepted}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2 py-0.5 rounded bg-matched-green/10 text-matched-green border border-matched-green/20 font-mono text-[10px] uppercase">
                          {b.batch_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-ink-700 text-[10px]">
                        {b.submitted_at ? new Date(b.submitted_at).toLocaleTimeString('en-US', { hour12: false }) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
