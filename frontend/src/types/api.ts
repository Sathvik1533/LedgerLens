export type ExceptionType =
  | 'missing_settlement'
  | 'missing_bank_credit'
  | 'amount_mismatch'
  | 'fee_mismatch'
  | 'duplicate_payment'
  | 'duplicate_bank_credit'
  | 'partial_refund_not_reflected'
  | 'ambiguous_match';

export type DecisionStatus = 'needs_review' | 'auto_reconciled' | 'rejected' | 'unresolved';

export interface ReviewQueueItem {
  case_id: string;
  payment_id: string;
  exception_type: ExceptionType | null;
  decision_status: DecisionStatus;
  confidence: string;
  expected_net_settlement: string | null;
  reported_net_settlement: string | null;
  settlement_discrepancy: string | null;
  case_opened_at: string;
  amount_at_risk: string | null;
  is_demo?: boolean;
}

export interface ReviewQueueResponse {
  total_cases: number;
  total_amount_at_risk: string;
  cases: ReviewQueueItem[];
  is_simulation?: boolean;
}

export interface PaymentFacts {
  payment_id: string;
  order_id: string;
  merchant_id: string;
  amount: string;
  currency: string;
  status: string;
  payment_timestamp: string | null;
  settlement_id: string | null;
}

export interface SettlementFacts {
  settlement_id: string;
  gross_payment_amount: string;
  fee_amount: string;
  tax_amount: string;
  net_settlement_amount: string;
  settlement_status: string;
  settlement_timestamp: string | null;
}

export interface BankCreditFacts {
  bank_credit_id: string;
  bank_account_id: string;
  bank_name: string;
  bank_reference: string;
  credited_amount: string;
  currency: string;
  bank_credit_timestamp: string | null;
  bank_credit_status: string;
  narration: string | null;
}

export interface RefundFacts {
  refund_id: string;
  refund_amount: string;
  currency: string;
  refund_status: string;
  refund_type: string;
  refund_timestamp: string | null;
}

export interface CaseEvidenceResponse {
  case_id: string;
  payment_id: string;
  exception_type: ExceptionType;
  decision_status: DecisionStatus;
  expected_net_settlement: string | null;
  reported_net_settlement: string | null;
  settlement_discrepancy: string | null;
  currency: string;
  version: number;
  case_opened_at: string | null;
  payment: PaymentFacts | null;
  settlement: SettlementFacts | null;
  bank_credits: BankCreditFacts[];
  refunds?: RefundFacts[];
}

export interface HumanReviewRequest {
  actor: string;
  action: 'approve' | 'reject' | 'mark_unresolved';
  expected_version: number;
  human_comment?: string;
  selected_candidate_id?: string | null;
}

export interface HumanReviewResponse {
  review_action_id: string;
  case_id: string;
  actor: string;
  action: string;
  current_version: number;
  previous_decision_status: string;
  new_decision_status: string;
  human_comment: string | null;
  actioned_at: string;
  audit_event_id: string;
}

export interface AuditEventItem {
  id: string;
  event_type: string;
  actor: string;
  case_id: string | null;
  batch_id: string | null;
  previous_status: string | null;
  new_status: string | null;
  occurred_at: string;
}

export interface Citation {
  source_file: string;
  quote: string;
}

export interface InvestigationResult {
  summary: string;
  root_cause_analysis: string;
  recommended_action: string;
  citations: Citation[];
  is_confident: boolean;
}

export interface ReconciliationStats {
  total_payments_count: number;
  total_settlements_count: number;
  total_refunds_count: number;
  total_bank_credits_count: number;
  total_cases: number;
  auto_reconciled_count: number;
  needs_review_count: number;
  unresolved_count: number;
  match_rate_percentage: number;
  total_amount_reconciled: string;
  total_amount_at_risk: string;
  exception_breakdown: Record<string, number>;
}

export interface FeedInfo {
  name: string;
  count: number;
  status: string;
  source: string;
}

export interface IngestionBatchItem {
  id: string;
  idempotency_key: string;
  batch_status: string;
  source_filename: string;
  source_tables: string[];
  row_count_submitted: number;
  row_count_accepted: number;
  row_count_rejected: number;
  submitted_at: string | null;
  completed_at: string | null;
}

export interface IngestionStatusResponse {
  feeds: Record<string, FeedInfo>;
  batches: IngestionBatchItem[];
}

export interface PolicyDocument {
  filename: string;
  title: string;
  content: string;
  line_count: number;
}

export interface PolicyCorpusResponse {
  corpus_version: string;
  grounding_floor: number;
  documents: PolicyDocument[];
}

export interface PolicySearchResult {
  query: string;
  grounding_floor: number;
  matched_chunks: Array<{
    source_file: string;
    line_start: number;
    line_end: number;
    text: string;
    similarity_score: number;
    is_grounded: boolean;
  }>;
}

export interface BenchmarkExceptionCategory {
  category: string;
  label: string;
  count: number;
  exposure_inr: string;
  representative_case_id: string | null;
  representative_payment_id: string | null;
  policy_sop: string;
  resolution_path: string;
  present_in_batch?: boolean;
}

export interface ReconciliationBenchmarkResponse {
  benchmark_name?: string;
  has_run: boolean;
  status?: string;
  message?: string;
  run_id?: string | null;
  timestamp_utc: string | null;
  dataset_size: number;
  seed?: number;
  elapsed_seconds?: number | null;
  throughput_records_per_sec?: number | null;
  throughput_unit?: string;
  match_rate_percentage?: number | null;
  precision_auto_reconcile?: number | null;
  recall_auto_reconcile?: number | null;
  false_approvals?: number;
  zero_false_approval_invariant?: string;
  summary: {
    total_records: number;
    auto_reconciled_count: number;
    needs_review_count: number;
    unresolved_count: number;
    total_amount_reconciled_inr: string;
    total_amount_at_risk_inr: string;
  };
  denominator_definition?: string | null;
  match_rate_formula?: string | null;
  throughput_command?: string;
  throughput_environment?: string;
  data_scope?: string | null;
  deterministic_vs_ai?: string | null;
  exception_categories: BenchmarkExceptionCategory[];
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'reviewer' | 'admin';
}

