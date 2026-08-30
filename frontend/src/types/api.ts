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
}

export interface ReviewQueueResponse {
  total_cases: number;
  total_amount_at_risk: string;
  cases: ReviewQueueItem[];
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
