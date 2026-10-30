// Central API configuration - reads from environment variable
// Client Components use NEXT_PUBLIC_API_URL (exposed to browser)
// Server Components use INTERNAL_API_URL (Docker internal network)

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

export const INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_URL || "http://backend:8000";

/**
 * Build a full API URL for Client Components (browser-side fetch)
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Build a full API URL for Server Components (server-side fetch inside Docker)
 */
export function internalApiUrl(path: string): string {
  return `${INTERNAL_API_BASE_URL}${path}`;
}

/**
 * A wrapper around fetch that automatically injects the auth token
 * and redirects to /login?expired=1 if the response is 401 Unauthorized.
 * Intended for Client Components only.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("geo_token") : null;
  const headers = new Headers(options.headers);
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem("geo_token");
    // Prevent redirect loop if already on login page
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?expired=1';
    }
  }

  return response;
}
