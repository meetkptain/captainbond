/**
 * Lightweight browser API client with JSON parsing, timeout and error normalization.
 * Server-side code should keep using fetch/withApiHandler directly.
 */

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiClient<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const { timeout = 15000, ...init } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: 'include',
      ...init,
      signal: controller.signal,
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const payload = data as { error?: string; code?: string };
      throw new ApiClientError(
        payload.error || `Erreur HTTP ${res.status}`,
        res.status,
        payload.code
      );
    }

    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get<T>(url: string, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(url, { ...options, method: 'GET' });
  },

  post<T>(url: string, body?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(url, { ...options, method: 'DELETE' });
  },
};
