/**
 * API Client for custom backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pixel-palette-backend.onrender.com/api';

/**
 * Custom fetch wrapper that automatically injects the JWT token
 * and handles base URL and token refresh on 401.
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response = await fetch(url, {
    ...options,
    headers: getHeaders(),
  });

  // Handle Token Refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const raw = await refreshRes.json();
          const data = raw.data || raw;
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          
          // Retry original request with new token
          response = await fetch(url, {
            ...options,
            headers: getHeaders(),
          });
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth'; // Redirect to login page
        throw err;
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred while fetching data';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error?.message || errorData.message || errorData.error || errorMsg;
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg);
    } catch {
      // If response is not JSON
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }

  // Some endpoints (like 204 No Content) might return empty body
  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}
