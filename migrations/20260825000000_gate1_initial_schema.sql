-- 1. Extensions & Schema Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS evaluator;

-- 2. Ingestion Batches & Idempotency
CREATE TABLE public.ingestion_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT NOT NULL UNIQUE,
    batch_status TEXT NOT NULL CHECK (
        batch_status IN (
            'received', 'validating', 'processing',
            'completed', 'completed_with_errors',
            'rejected', 'paused', 'failed', 'already_processed'
        )
    ),
    source_filename TEXT,
    source_tables TEXT[] NOT NULL,
    row_count_submitted INTEGER,
    row_count_accepted INTEGER,
    row_count_rejected INTEGER,
    failure_type TEXT CHECK (
        failure_type IS NULL OR failure_type IN (
            'missing_required_columns', 'invalid_amount',
            'ai_timeout', 'ai_malformed_json', 'db_unavailable'
        )
    ),
    failure_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Raw Source Tables (Immutable)
CREATE TABLE public.payments_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    source_row_index INTEGER NOT NULL,
    raw_payload JSONB NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, source_row_index)
);

CREATE TABLE public.refunds_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    source_row_index INTEGER NOT NULL,
    raw_payload JSONB NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, source_row_index)
);

CREATE TABLE public.settlements_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    source_row_index INTEGER NOT NULL,
    raw_payload JSONB NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, source_row_index)
);

CREATE TABLE public.bank_credits_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    source_row_index INTEGER NOT NULL,
    raw_payload JSONB NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, source_row_index)
);

-- 4. Normalised Tables
CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id UUID NOT NULL UNIQUE REFERENCES public.settlements_raw(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    settlement_id TEXT NOT NULL UNIQUE,
    merchant_id TEXT NOT NULL,
    settlement_type TEXT NOT NULL,
    gross_payment_amount NUMERIC(18,2) NOT NULL CHECK (gross_payment_amount >= 0),
    refund_amount NUMERIC(18,2) NOT NULL CHECK (refund_amount >= 0),
    fee_amount NUMERIC(18,2) NOT NULL CHECK (fee_amount >= 0),
    tax_amount NUMERIC(18,2) NOT NULL CHECK (tax_amount >= 0),
    adjustment_amount NUMERIC(18,2) NOT NULL,
    net_settlement_amount NUMERIC(18,2) NOT NULL CHECK (net_settlement_amount >= 0),
    currency TEXT NOT NULL CHECK (char_length(currency) >= 3),
    settlement_status TEXT NOT NULL,
    settlement_timestamp TIMESTAMPTZ NOT NULL,
    expected_settlement_timestamp TIMESTAMPTZ,
    normalised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id UUID NOT NULL UNIQUE REFERENCES public.payments_raw(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    payment_id TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (char_length(currency) >= 3),
    status TEXT NOT NULL,
    payment_timestamp TIMESTAMPTZ NOT NULL,
    captured_timestamp TIMESTAMPTZ,
    settlement_id TEXT REFERENCES public.settlements(settlement_id) DEFERRABLE INITIALLY DEFERRED,
    normalised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id UUID NOT NULL UNIQUE REFERENCES public.refunds_raw(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    refund_id TEXT NOT NULL UNIQUE,
    payment_id TEXT NOT NULL REFERENCES public.payments(payment_id) DEFERRABLE INITIALLY DEFERRED,
    order_id TEXT NOT NULL,
    refund_amount NUMERIC(18,2) NOT NULL CHECK (refund_amount > 0),
    currency TEXT NOT NULL CHECK (char_length(currency) >= 3),
    refund_status TEXT NOT NULL,
    refund_timestamp TIMESTAMPTZ NOT NULL,
    refund_type TEXT NOT NULL,
    normalised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bank_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id UUID NOT NULL UNIQUE REFERENCES public.bank_credits_raw(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    bank_credit_id TEXT NOT NULL UNIQUE,
    bank_account_id TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    bank_reference TEXT NOT NULL UNIQUE,
    settlement_id TEXT REFERENCES public.settlements(settlement_id) DEFERRABLE INITIALLY DEFERRED,
    credited_amount NUMERIC(18,2) NOT NULL CHECK (credited_amount > 0),
    currency TEXT NOT NULL CHECK (char_length(currency) >= 3),
    bank_credit_timestamp TIMESTAMPTZ NOT NULL,
    bank_credit_status TEXT NOT NULL,
    narration TEXT,
    normalised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Reconciliation Cases & Evidence
CREATE TABLE public.reconciliation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ingestion_batches(id) ON DELETE RESTRICT,
    payment_id TEXT NOT NULL REFERENCES public.payments(payment_id) ON DELETE RESTRICT,
    exception_type TEXT CHECK (
        exception_type IS NULL OR exception_type IN (
            'missing_settlement', 'missing_bank_credit', 'amount_mismatch',
            'fee_mismatch', 'duplicate_payment', 'duplicate_bank_credit',
            'partial_refund_not_reflected', 'ambiguous_match'
        )
    ),
    decision_status TEXT NOT NULL CHECK (
        decision_status IN (
            'auto_reconciled', 'needs_review', 'unresolved',
            'rejected', 'blocked', 'already_processed'
        )
    ),
    resolution_reason TEXT CHECK (
        resolution_reason IS NULL OR resolution_reason IN (
            'matched', 'no_candidate_found', 'multiple_candidates',
            'rejected_hard_conflict', 'blocked_invalid_row', 'duplicate_batch'
        )
    ),
    confidence TEXT NOT NULL CHECK (
        confidence IN ('high', 'medium', 'low', 'unavailable', 'not_applicable')
    ),
    technical_status TEXT NOT NULL CHECK (
        technical_status IN ('success', 'retrying', 'degraded', 'failed', 'paused')
    ),
    failure_type TEXT CHECK (
        failure_type IS NULL OR failure_type IN (
            'missing_required_columns', 'invalid_amount',
            'ai_timeout', 'ai_malformed_json', 'db_unavailable'
        )
    ),
    failure_reason TEXT,
    expected_net_settlement NUMERIC(18,2),
    reported_net_settlement NUMERIC(18,2),
    settlement_discrepancy NUMERIC(18,2),
    currency TEXT,
    selected_candidate_id UUID,
    case_opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    case_closed_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (payment_id, batch_id),
    CONSTRAINT chk_rc_auto_reconciled_confidence CHECK (
        decision_status <> 'auto_reconciled' OR confidence = 'high'
    )
);

CREATE TABLE public.candidate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.reconciliation_cases(id) ON DELETE RESTRICT,
    match_stage TEXT NOT NULL CHECK (
        match_stage IN ('exact_identifier', 'deterministic_multi_field', 'broader_pass', 'ai_suggestion')
    ),
    candidate_type TEXT NOT NULL CHECK (
        candidate_type IN ('settlement', 'bank_credit', 'refund', 'payment')
    ),
    candidate_entity_id TEXT NOT NULL,
    match_score NUMERIC(5,4) CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 1)),
    matching_fields JSONB,
    conflicting_fields JSONB,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    ai_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reconciliation_cases
ADD CONSTRAINT fk_selected_candidate
FOREIGN KEY (selected_candidate_id) REFERENCES public.candidate_matches(id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE public.evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.reconciliation_cases(id) ON DELETE RESTRICT,
    evidence_type TEXT NOT NULL CHECK (
        evidence_type IN ('deterministic', 'ai_explanation', 'ai_recommendation')
    ),
    source_table TEXT,
    source_entity_id TEXT,
    content JSONB NOT NULL,
    model_version TEXT,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Human Review Actions & Audit Events
CREATE TABLE public.human_review_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.reconciliation_cases(id) ON DELETE RESTRICT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'mark_unresolved')),
    previous_decision_status TEXT NOT NULL,
    new_decision_status TEXT NOT NULL,
    selected_candidate_id UUID REFERENCES public.candidate_matches(id) ON DELETE RESTRICT,
    evidence_refs UUID[],
    ai_output_ref UUID REFERENCES public.evidence_items(id) ON DELETE RESTRICT,
    human_comment TEXT,
    actioned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'batch_received', 'batch_validating', 'batch_processing',
            'batch_completed', 'batch_completed_with_errors',
            'batch_rejected', 'batch_paused', 'batch_failed',
            'duplicate_batch_detected', 'row_excluded_data_quality',
            'case_opened', 'case_auto_reconciled', 'case_needs_review',
            'case_unresolved_no_candidate', 'case_blocked',
            'ambiguous_match_flagged', 'human_approved', 'human_rejected',
            'human_marked_unresolved', 'ai_call_timeout', 'ai_output_rejected',
            'db_unavailable_retry', 'db_unavailable_paused'
        )
    ),
    actor TEXT NOT NULL,
    batch_id UUID REFERENCES public.ingestion_batches(id) DEFERRABLE INITIALLY DEFERRED,
    case_id UUID REFERENCES public.reconciliation_cases(id) DEFERRABLE INITIALLY DEFERRED,
    previous_status TEXT,
    new_status TEXT,
    evidence_summary JSONB,
    model_version TEXT,
    failure_type TEXT,
    failure_reason TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Evaluator-Isolated Schema & Ground Truth
CREATE TABLE evaluator.ground_truth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE,
    expected_status TEXT NOT NULL,
    exception_type TEXT CHECK (
        exception_type IS NULL OR exception_type IN (
            'missing_settlement', 'missing_bank_credit', 'amount_mismatch',
            'fee_mismatch', 'duplicate_payment', 'duplicate_bank_credit',
            'partial_refund_not_reflected', 'ambiguous_match'
        )
    ),
    expected_resolution_reason TEXT,
    true_payment_id TEXT NOT NULL,
    true_settlement_id TEXT,
    expected_net_amount NUMERIC(18,2),
    expected_settlement_date DATE,
    requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
    injection_type TEXT NOT NULL CHECK (injection_type IN ('clean', 'injected_exception')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evaluator.evaluation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_label TEXT NOT NULL,
    run_condition TEXT NOT NULL CHECK (run_condition IN ('rules_only', 'rules_plus_ai', 'rules_plus_ai_plus_rag')),
    dataset_version TEXT NOT NULL,
    random_seed TEXT NOT NULL,
    code_commit TEXT NOT NULL,
    model_version TEXT,
    retrieval_config TEXT,
    confidence_thresholds JSONB,
    batch_id UUID REFERENCES public.ingestion_batches(id),
    total_cases INTEGER,
    auto_reconciled_count INTEGER,
    needs_review_count INTEGER,
    unresolved_count INTEGER,
    false_auto_approvals INTEGER,
    match_rate NUMERIC(5,4),
    throughput_records_per_sec NUMERIC(10,4),
    batch_duration_seconds NUMERIC(10,3),
    run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT
);

-- 8. Performance & Integrity Indexes
CREATE INDEX idx_payments_payment_id ON public.payments(payment_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_settlement_id ON public.payments(settlement_id) WHERE settlement_id IS NOT NULL;
CREATE INDEX idx_settlements_settlement_id ON public.settlements(settlement_id);
CREATE INDEX idx_bank_credits_bank_reference ON public.bank_credits(bank_reference);
CREATE INDEX idx_bank_credits_settlement_id ON public.bank_credits(settlement_id) WHERE settlement_id IS NOT NULL;
CREATE INDEX idx_rc_decision_status ON public.reconciliation_cases(decision_status);
CREATE INDEX idx_rc_exception_type ON public.reconciliation_cases(exception_type) WHERE exception_type IS NOT NULL;
CREATE INDEX idx_cm_case_id ON public.candidate_matches(case_id);
CREATE INDEX idx_ei_case_id ON public.evidence_items(case_id);
CREATE INDEX idx_hra_case_id ON public.human_review_actions(case_id);
CREATE INDEX idx_ae_case_id ON public.audit_events(case_id);
CREATE INDEX idx_ae_event_type ON public.audit_events(event_type);
CREATE INDEX idx_gt_case_id ON evaluator.ground_truth(case_id);
