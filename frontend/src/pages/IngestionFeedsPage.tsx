import React, { useState, useEffect } from 'react';
import { fetchIngestionStatus, uploadFeedCsv } from '../api/client';
import { IngestionStatusResponse } from '../types/api';
import { TactileSegmentedControl, TabOption } from '../components/ui/TactileSegmentedControl';

const FEEDS = [
  {
    id: 'payments' as const,
    label: '1. Merchant Payments',
    description: 'Captured payments feed (payment_id, order_id, amount, currency, timestamp)',
    schema: 'payment_id, order_id, merchant_id, amount, currency, status, payment_timestamp',
  },
  {
    id: 'settlements' as const,
    label: '2. Gateway Settlements',
    description: 'Gateway payout batch items (settlement_id, gross, fee, tax, net payout)',
    schema: 'settlement_id, gross_payment_amount, fee_amount, tax_amount, net_settlement_amount, settlement_status, settlement_timestamp',
  },
  {
    id: 'refunds' as const,
    label: '3. Customer Refunds',
    description: 'Reversals and partial refunds (refund_id, payment_id, refund_amount, refund_type)',
    schema: 'refund_id, payment_id, order_id, refund_amount, currency, refund_status, refund_timestamp, refund_type',
  },
  {
    id: 'bank-credits' as const,
    label: '4. Bank Statement Credits',
    description: 'Direct institutional credits (bank_credit_id, bank_reference/UTR, credited_amount)',
    schema: 'bank_credit_id, bank_account_id, bank_name, bank_reference, credited_amount, currency, bank_credit_timestamp, bank_credit_status',
  },
];

const FEED_TAB_OPTIONS: TabOption<'payments' | 'settlements' | 'refunds' | 'bank-credits'>[] = [
  { id: 'payments', label: '1. Payments' },
  { id: 'settlements', label: '2. Settlements' },
  { id: 'refunds', label: '3. Refunds' },
  { id: 'bank-credits', label: '4. Bank Credits' },
];

export const IngestionFeedsPage: React.FC = () => {
  const [selectedFeed, setSelectedFeed] = useState<'payments' | 'settlements' | 'refunds' | 'bank-credits'>('payments');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [statusData, setStatusData] = useState<IngestionStatusResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchIngestionStatus();
      setStatusData(data);
    } catch {}
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setUploadResult(null);

    // Explicit check: Submitting with no file MUST produce an immediate visible message
    if (!file) {
      setValidationError('Please select a valid CSV file before submitting the ingestion batch.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFeedCsv(selectedFeed, file, idempotencyKey || undefined);
      setUploadResult(result);
      setFile(null);
      setIdempotencyKey('');
      loadStatus();
    } catch (err: any) {
      setValidationError(err.message || 'Ingestion failed during CSV validation.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const activeFeedMeta = FEEDS.find((f) => f.id === selectedFeed)!;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-10 font-sans">
      {/* 1. Masthead */}
      <div className="space-y-1 border-b border-rule pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <span>FOUR-SOURCE INTAKE CONTROLS</span>
          <span>&bull;</span>
          <span className="text-ink font-semibold">Idempotent Batch Processing</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
          Ingestion feeds & source intake
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans max-w-2xl leading-relaxed">
          Upload raw source CSV files for merchant payments, gateway settlements, customer refunds, and bank statements. Duplicate submissions are safely replayed via idempotency keys without mutating ledger facts.
        </p>
      </div>

      {/* 2. Feed Source Tabs */}
      <div className="space-y-4">
        <div className="flex justify-start">
          <TactileSegmentedControl
            options={FEED_TAB_OPTIONS}
            activeId={selectedFeed}
            onChange={(id) => {
              setSelectedFeed(id);
              setValidationError(null);
              setUploadResult(null);
            }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FEEDS.map((f) => {
          const isSelected = selectedFeed === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFeed(f.id);
                setValidationError(null);
                setUploadResult(null);
              }}
              className={`p-4 text-left border rounded-xs transition-colors space-y-1.5 ${
                isSelected
                  ? 'border-ink bg-surface shadow-subtle'
                  : 'border-rule bg-canvas hover:bg-surface text-ink-secondary'
              }`}
            >
              <span className={`font-mono text-xs font-semibold block ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>
                {f.label}
              </span>
              <p className="text-[11px] font-sans text-ink-secondary leading-normal line-clamp-2">
                {f.description}
              </p>
            </button>
          );
        })}
        </div>
      </div>

      {/* 3. Ingestion Form & Schema Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        {/* Upload Form */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-5 shadow-subtle">
          <div className="border-b border-rule pb-3 space-y-0.5">
            <span className="font-editorial text-xl font-medium text-ink block">
              Submit batch for {activeFeedMeta.label}
            </span>
            <span className="text-xs text-ink-secondary font-mono">
              Enforcing ACID persistence and source deduplication
            </span>
          </div>

          {/* Immediate Visible Validation Notice */}
          {validationError && (
            <div
              role="alert"
              className="p-3.5 bg-critical/10 border border-critical/40 rounded-xs text-xs text-critical font-mono"
            >
              <strong>Validation Notice:</strong> {validationError}
            </div>
          )}

          {/* Success / Duplicate Replay Result */}
          {uploadResult && (
            <div className="p-4 bg-ledger-green/10 border border-ledger-green/40 rounded-xs space-y-2 text-xs font-mono text-ink">
              <div className="flex items-center justify-between font-semibold text-ledger-green">
                <span>✓ {uploadResult.status === 'duplicate_replayed' ? 'Duplicate Batch Replayed' : 'Batch Ingested Successfully'}</span>
                <span>Batch: {uploadResult.batch_id}</span>
              </div>
              <div className="text-[11px] text-ink-secondary space-y-1 pt-1 border-t border-ledger-green/20">
                <div>Accepted rows: <strong className="text-ink">{uploadResult.accepted_rows ?? uploadResult.total_rows ?? 0}</strong></div>
                <div>Rejected rows: <strong className="text-ink">{uploadResult.rejected_rows ?? 0}</strong></div>
                <div>Idempotency key: {uploadResult.idempotency_key || 'Auto-generated'}</div>
                {uploadResult.status === 'duplicate_replayed' && (
                  <div className="text-brass italic pt-1">
                    Notice: This exact payload was previously ingested. The existing records were returned without duplicating financial transactions.
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            {/* File selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-ink-secondary block">
                Source CSV Document
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setValidationError(null);
                }}
                className="w-full text-xs font-mono text-ink-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-xs file:border file:border-rule file:text-xs file:font-sans file:bg-canvas file:text-ink hover:file:bg-rule/40 cursor-pointer"
              />
              {file && (
                <span className="text-[11px] font-mono text-ink block">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            {/* Optional Idempotency Key */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-ink-secondary block">
                Batch Idempotency Key (Optional)
              </label>
              <input
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                placeholder="e.g. BATCH-2026-0903-SET-01"
                className="w-full px-3 py-1.5 border border-rule bg-canvas text-ink font-mono text-xs rounded-xs focus:outline-none focus:border-ink"
              />
              <span className="text-[10px] text-ink-muted block font-mono">
                Submitting the same idempotency key prevents duplicate transaction creation.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 bg-ink hover:bg-ink/90 text-canvas font-medium text-xs rounded-xs transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Validating & ingesting...' : 'Submit ingestion batch'}
            </button>
          </form>
        </div>

        {/* Schema Expectations & Contract Guide */}
        <div className="border border-rule bg-canvas p-6 rounded-xs space-y-4 text-xs font-sans">
          <span className="font-editorial text-lg font-medium text-ink block">
            Contract schema expectations
          </span>
          <p className="text-xs text-ink-secondary leading-relaxed">
            The deterministic ingestion engine validates header columns and enforces decimal float-free parsing before committing rows to the raw ingestion tables.
          </p>

          <div className="space-y-1 pt-2 border-t border-rule">
            <span className="text-[11px] font-mono uppercase text-ink-secondary block">
              Required CSV Column Headers
            </span>
            <div className="p-3 bg-surface border border-rule rounded-xs font-mono text-[11px] text-ink break-all">
              {activeFeedMeta.schema}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-rule text-[11px] text-ink-secondary font-mono">
            <div>&bull; Float values are strictly prohibited (numeric exact).</div>
            <div>&bull; Timestamps must follow ISO-8601 with explicit timezone.</div>
            <div>&bull; Missing required headers rejects the entire batch.</div>
            <div>&bull; Invalid row amounts are rejected; valid rows continue.</div>
          </div>
        </div>
      </div>

      {/* 4. Historical Ingestion Batches Ledger */}
      {statusData && statusData.batches && statusData.batches.length > 0 && (
        <div className="border border-rule bg-surface rounded-xs overflow-hidden shadow-subtle space-y-0">
          <div className="p-4 border-b border-rule flex justify-between items-center bg-canvas/60">
            <span className="font-editorial text-lg font-medium text-ink">
              Recent ingestion batch ledger
            </span>
            <span className="text-xs font-mono text-ink-secondary">
              {statusData.batches.length} recorded batches
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-rule bg-canvas/80 text-[11px] font-mono text-ink-secondary">
                <th className="py-2.5 px-4 font-normal">Source Type</th>
                <th className="py-2.5 px-4 font-normal">Batch Identifier</th>
                <th className="py-2.5 px-4 font-normal">Idempotency Key</th>
                <th className="py-2.5 px-4 font-normal text-right">Rows</th>
                <th className="py-2.5 px-4 font-normal text-right">Ingested Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {statusData.batches.map((b) => (
                <tr key={b.id} className="h-[40px] hover:bg-canvas/40 transition-colors font-mono text-[11px]">
                  <td className="py-2 px-4 font-sans text-xs font-medium text-ink">
                    {b.source_filename || (b.source_tables && b.source_tables.join(', ')) || 'Batch Feed'}
                  </td>
                  <td className="py-2 px-4 text-ink-secondary truncate max-w-[140px]">
                    <button
                      onClick={() => copyText(b.id, b.id)}
                      className="hover:text-ink text-link underline"
                      title="Click to copy batch ID"
                    >
                      {b.id.slice(0, 8)}...
                    </button>
                    {copiedKey === b.id && <span className="ml-1 text-ledger-green">✓</span>}
                  </td>
                  <td className="py-2 px-4 text-ink-secondary truncate max-w-[160px]">
                    {b.idempotency_key || '—'}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-semibold text-ink">
                    {b.row_count_submitted ?? b.row_count_accepted ?? 0}
                  </td>
                  <td className="py-2 px-4 text-right text-ink-secondary whitespace-nowrap">
                    {b.submitted_at ? new Date(b.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IngestionFeedsPage;
