/**
 * LedgerLens User-Facing Content Map
 * Maps all internal reconciliation, exception, and benchmark features
 * to clear, non-technical plain English explanations for finance operators.
 */

export interface FeatureContentItem {
  title: string;
  oneSentence: string;
  whyItMatters: string;
  nextAction: string;
  successMessage: string;
  warningMessage: string;
  errorMessage: string;
  technicalExplanation?: string;
}

export const LEDGERLENS_CONTENT_MAP: Record<string, FeatureContentItem> = {
  dashboard: {
    title: 'Financial Controller Overview',
    oneSentence: 'Live status of automated four-way matching across transactions, settlements, bank credits, and refunds.',
    whyItMatters: 'Surfaces unresolved payment discrepancies and exposure amounts before period-end ledger close.',
    nextAction: 'Navigate to Review Queue to resolve items requiring operator attention.',
    successMessage: 'Zero drift: all reconciled transactions match to the nearest cent/paisa.',
    warningMessage: 'Some payment records do not match. Manual inspection recommended.',
    errorMessage: 'Failed to refresh financial metrics. Retrying connection.',
    technicalExplanation: 'Multi-stream four-way deterministic matching engine with PostgreSQL ACID transactional persistence.',
  },
  queue: {
    title: 'Financial Exceptions Queue',
    oneSentence: 'Items flagged where transaction records, settlement reports, or bank credits do not align.',
    whyItMatters: 'Prevents revenue leakage, uncredited gateway deposits, and duplicate payouts.',
    nextAction: 'Select an exception to review the transaction details and record a resolution.',
    successMessage: 'All queue items resolved. Financial books are currently in balance.',
    warningMessage: 'High-risk discrepancies detected that require controller sign-off.',
    errorMessage: 'Unable to load exceptions queue from server.',
    technicalExplanation: 'Rule-driven discrepancy classifier categorizing candidate breaks by amount variance and missing counterparties.',
  },
  caseDetail: {
    title: 'Discrepancy Investigation',
    oneSentence: 'Detailed breakdown of recorded vs expected values across all counterparty sources for this transaction.',
    whyItMatters: 'Ensures decisions are backed by verifiable audit evidence before funds are adjusted.',
    nextAction: 'Review the counterparty evidence, select a resolution code, and submit your decision.',
    successMessage: 'Decision recorded permanently in immutable audit trail.',
    warningMessage: 'Variance exceeds auto-approval tolerance. Human sign-off required.',
    errorMessage: 'Could not retrieve case evidence dossier.',
    technicalExplanation: 'Optimistic locking with version increment on case transition and append-only audit event logging.',
  },
  evaluation: {
    title: 'Reconciliation Accuracy Check',
    oneSentence: 'Checks for common payment problems including missing payments, duplicate records, amount differences, and refund issues.',
    whyItMatters: 'Guarantees that automated rules never produce false approvals or silently drop uncollected revenue.',
    nextAction: 'Run accuracy check to verify rule coverage and throughput performance.',
    successMessage: 'All 8 common difference types checked and passing with 0 false approvals.',
    warningMessage: 'Evaluation harness reported candidate exceptions requiring rule tuning.',
    errorMessage: 'Benchmark run failed to complete.',
    technicalExplanation: '60-record deterministic benchmark harness verified against ground truth fixtures with Decimal precision.',
  },
  feeds: {
    title: 'Data Ingestion Feeds',
    oneSentence: 'Incoming transaction streams from order management, payment gateways, and banking partners.',
    whyItMatters: 'Ensures comprehensive data capture across all four financial counterparties.',
    nextAction: 'Verify feed freshness and ingest new batch files.',
    successMessage: 'All feeds active and synchronized with latest settlement cycle.',
    warningMessage: 'Bank statement feed delayed by more than 24 hours.',
    errorMessage: 'Connection to ingestion endpoint timed out.',
    technicalExplanation: 'Multi-provider ingestion layer parsing gateway webhooks, ISO bank statements, and order events.',
  },
  audit: {
    title: 'Permanent Audit Trail',
    oneSentence: 'Immutable history of every automated match and controller review action.',
    whyItMatters: 'Satisfies statutory compliance requirements and provides proof for internal & external audits.',
    nextAction: 'Filter by actor or date range to inspect audit history or export compliance reports.',
    successMessage: 'Audit log verified: zero record tampering or sequence gaps.',
    warningMessage: 'Filtered query returned no matching audit entries.',
    errorMessage: 'Could not query audit event store.',
    technicalExplanation: 'Cryptographically ordered append-only audit table with actor UUID, timestamp, and before/after states.',
  },
  policy: {
    title: 'Reconciliation Guidelines & Policy',
    oneSentence: 'Official accounting standards and operational playbooks for resolving financial exceptions.',
    whyItMatters: 'Ensures consistent, compliant handling of disputes and refunds across the finance team.',
    nextAction: 'Search standard operating procedures to verify resolution steps.',
    successMessage: 'Relevant accounting policy contract matched with high confidence.',
    warningMessage: 'No specific policy found for this custom discrepancy scenario.',
    errorMessage: 'Policy knowledge base is currently unavailable.',
    technicalExplanation: 'Context-grounded RAG retriever matching standard operating procedure contracts.',
  },
};
