import {
  ReviewQueueResponse,
  CaseEvidenceResponse,
  HumanReviewRequest,
  HumanReviewResponse,
  AuditEventItem,
  InvestigationResult,
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
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
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

  return data as T;
}

export async function fetchReviewQueue(exceptionType?: string): Promise<ReviewQueueResponse> {
  const query = exceptionType && exceptionType !== 'all' ? `?exception_type=${encodeURIComponent(exceptionType)}` : '';
  return request<ReviewQueueResponse>(`/review/queue${query}`);
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
