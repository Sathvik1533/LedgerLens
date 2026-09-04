import {
  ReviewQueueResponse,
  CaseEvidenceResponse,
  HumanReviewRequest,
  HumanReviewResponse,
  AuditEventItem,
  InvestigationResult,
  AuthUser,
} from '../types/api';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-LedgerLens-CSRF': '1',
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const signal = options.signal || controller.signal;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers,
      signal,
    });
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError') {
      throw new ApiError(504, 'The request took too long. Please check backend availability.');
    }
    throw new ApiError(0, 'We could not load this information. Please check your connection.');
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let errorMsg = `HTTP error ${response.status}: ${response.statusText}`;
    if (response.status === 401) {
      errorMsg = 'Your session has ended. Please sign in again.';
    } else if (response.status === 403) {
      errorMsg = (data && data.detail) || 'You do not have permission to perform this action. Administrator access is required.';
    } else if (data) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        errorMsg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      } else if (typeof data.message === 'string') {
        errorMsg = data.message;
      }
    }
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}

export async function fetchReviewQueue(exceptionType?: string): Promise<ReviewQueueResponse> {
  const query = exceptionType && exceptionType !== 'all' ? `?exception_type=${encodeURIComponent(exceptionType)}` : '';
  try {
    const res = await request<any>(`/review/queue${query}`);
    if (Array.isArray(res)) {
      return {
        total_cases: res.length,
        total_amount_at_risk: '0.00',
        cases: res.map((c: any) => ({
          case_id: c.case_id || c.id,
          payment_id: c.payment_id,
          exception_type: c.exception_type,
          decision_status: c.decision_status,
          confidence: c.confidence,
          expected_net_settlement: c.expected_net_settlement,
          reported_net_settlement: c.reported_net_settlement,
          settlement_discrepancy: c.settlement_discrepancy,
          case_opened_at: c.case_opened_at,
          amount_at_risk: c.amount_at_risk || c.settlement_discrepancy || '0.00',
        })),
      };
    }
    if (res && Array.isArray(res.cases)) {
      return {
        total_cases: res.total_cases ?? res.cases.length,
        total_amount_at_risk: res.total_amount_at_risk || '0.00',
        cases: res.cases.map((c: any) => ({
          ...c,
          case_id: c.case_id || c.id,
          amount_at_risk: c.amount_at_risk || c.settlement_discrepancy || '0.00',
        })),
      };
    }
    return res as ReviewQueueResponse;
  } catch (err) {
    try {
      const fallbackCases = await request<any[]>(`/reconciliation/cases?decision_status=needs_review`);
      if (Array.isArray(fallbackCases)) {
        return {
          total_cases: fallbackCases.length,
          total_amount_at_risk: '0.00',
          cases: fallbackCases.map((c: any) => ({
            case_id: c.id || c.case_id,
            payment_id: c.payment_id,
            exception_type: c.exception_type,
            decision_status: c.decision_status,
            confidence: c.confidence,
            expected_net_settlement: c.expected_net_settlement,
            reported_net_settlement: c.reported_net_settlement,
            settlement_discrepancy: c.settlement_discrepancy,
            case_opened_at: c.case_opened_at,
            amount_at_risk: c.settlement_discrepancy || '0.00',
          })),
        };
      }
    } catch {
      // ignore fallback error and rethrow original
    }
    throw err;
  }
}

export async function fetchCaseDetail(caseId: string): Promise<CaseEvidenceResponse> {
  return request<CaseEvidenceResponse>(`/review/cases/${encodeURIComponent(caseId)}`);
}

export async function submitCaseReview(
  caseId: string,
  body: HumanReviewRequest
): Promise<HumanReviewResponse> {
  return request<HumanReviewResponse>(`/review/cases/${encodeURIComponent(caseId)}/review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchCaseAuditTrail(caseId: string): Promise<AuditEventItem[]> {
  return request<AuditEventItem[]>(`/review/cases/${encodeURIComponent(caseId)}/audit`);
}

export async function fetchAllAuditTrail(limit: number = 100, offset: number = 0): Promise<AuditEventItem[]> {
  return request<AuditEventItem[]>(`/review/audit/all?limit=${limit}&offset=${offset}`);
}

export async function investigateCase(caseId: string): Promise<InvestigationResult> {
  return request<InvestigationResult>(`/rag/investigate/${encodeURIComponent(caseId)}`, {
    method: 'POST',
  });
}

export async function fetchReconciliationStats(): Promise<import('../types/api').ReconciliationStats> {
  return request<import('../types/api').ReconciliationStats>('/reconciliation/stats');
}

export async function fetchReconciliationBenchmark(): Promise<import('../types/api').ReconciliationBenchmarkResponse> {
  return request<import('../types/api').ReconciliationBenchmarkResponse>('/reconciliation/benchmark');
}

export async function resetReconciliationBenchmark(): Promise<any> {
  return request<any>('/reconciliation/benchmark/reset', {
    method: 'POST',
  });
}

export async function triggerBenchmarkRun(size: number = 60, seed: number = 42): Promise<import('../types/api').ReconciliationBenchmarkResponse> {
  return request<import('../types/api').ReconciliationBenchmarkResponse>(`/reconciliation/benchmark/run?size=${size}&seed=${seed}`, {
    method: 'POST',
  });
}

export async function triggerReconciliationRun(): Promise<any> {
  return request<any>('/reconciliation/run', {
    method: 'POST',
  });
}

export async function fetchIngestionStatus(): Promise<import('../types/api').IngestionStatusResponse> {
  return request<import('../types/api').IngestionStatusResponse>('/ingestion/status');
}

export async function uploadFeedCsv(
  feedType: 'payments' | 'settlements' | 'refunds' | 'bank-credits',
  file: File,
  idempotencyKey?: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }

  const response = await fetch(`${API_BASE}/ingestion/${feedType}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.detail || data.message)) ||
      `HTTP error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data;
}

export async function fetchPolicyCorpus(): Promise<import('../types/api').PolicyCorpusResponse> {
  return request<import('../types/api').PolicyCorpusResponse>('/rag/policies');
}

export async function queryPolicyCorpus(
  query: string,
  top_k: number = 4
): Promise<import('../types/api').PolicySearchResult> {
  return request<import('../types/api').PolicySearchResult>('/rag/query', {
    method: 'POST',
    body: JSON.stringify({ query, top_k }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginDemoUser(role: 'reviewer' | 'admin' = 'reviewer'): Promise<AuthUser> {
  return request<AuthUser>('/auth/demo', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function logoutUser(): Promise<void> {
  await request<{ status: string }>('/auth/logout', {
    method: 'POST',
  });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me');
}

