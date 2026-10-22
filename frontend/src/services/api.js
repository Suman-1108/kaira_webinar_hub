/**
 * Centralized API Client & Route URL Resolver
 * 
 * Supports both:
 * 1. Vite proxy routing (default in dev: relative /api/... forwarded to http://127.0.0.1:5001)
 * 2. Explicit API Base URL (configured via VITE_API_BASE_URL, e.g. http://localhost:5001)
 */

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Resolve an API endpoint path to the full target URL
 * Prevents duplicated /api/api when base URL ends with /api and endpoint starts with /api
 * 
 * @param {string} endpoint Path (e.g. '/api/v1/auth/forgot-password' or 'v1/auth/forgot-password')
 */
export function getApiUrl(endpoint) {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (!RAW_BASE_URL) {
    return cleanEndpoint;
  }

  // If RAW_BASE_URL already ends with '/api' and cleanEndpoint starts with '/api/',
  // strip the redundant leading '/api' from cleanEndpoint to prevent '/api/api/...'
  if (RAW_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }

  return `${RAW_BASE_URL}${cleanEndpoint}`;
}

/**
 * Authenticated fetch helper that injects token and resolves URL
 */
export async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('kaira_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
}

export default {
  getApiUrl,
  apiRequest
};
