import {
  ReviewQueueResponse,
  CaseEvidenceResponse,
  HumanReviewRequest,
  HumanReviewResponse,
  AuditEventItem,
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
