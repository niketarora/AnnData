/**
 * Central API Client for Frontend
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 *
 * Connects the React Native / Expo application to the Express backend.
 * Never performs direct Supabase queries from the client.
 */

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiClient {
  private baseUrl: string;
  private authToken: string = 'farmer-demo-token';

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1';
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  public setRole(role: 'FARMER' | 'BUYER'): void {
    this.authToken = role === 'FARMER' ? 'farmer-demo-token' : 'buyer-demo-token';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.authToken}`,
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json: ApiResponseEnvelope<T> = await response.json().catch(() => ({
        success: response.ok,
        data: {} as T,
      }));

      if (!response.ok || !json.success) {
        const errorMsg = json.error?.message || `HTTP ${response.status} Request failed`;
        const err = new Error(errorMsg) as Error & {
          statusCode: number;
          code?: string;
          details?: unknown;
        };
        err.statusCode = response.status;
        err.code = json.error?.code;
        err.details = json.error?.details;
        throw err;
      }

      return json.data;
    } catch (err: any) {
      // Graceful offline/network error handling
      if (!err.statusCode) {
        err.statusCode = 0;
        err.code = 'NETWORK_ERROR';
      }
      throw err;
    }
  }

  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
