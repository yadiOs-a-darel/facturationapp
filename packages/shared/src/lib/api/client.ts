export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiRequestError(response.status, {
      code: body.error?.code ?? "unknown",
      message: body.error?.message ?? body.message ?? `Erreur ${response.status}`,
      details: body.error?.details,
    });
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function buildHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
    }
    const query = searchParams.toString();
    return fetch(`${url}${query ? `?${query}` : ""}`, {
      credentials: "include",
      headers: buildHeaders(),
    }).then(handleResponse<T>);
  },

  post<T>(url: string, body?: unknown): Promise<T> {
    return fetch(url, {
      method: "POST",
      credentials: "include",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  put<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  delete(url: string): Promise<void> {
    return fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(),
    }).then(handleResponse<void>);
  },
};
