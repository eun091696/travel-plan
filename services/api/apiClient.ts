import { AuthRequiredError, getAuthHeaders } from '../authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
};

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  }

  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function request(path: string, options: ApiRequestOptions = {}) {
  let response;
  const { skipAuth, ...fetchOptions } = options;
  const authHeaders = skipAuth ? {} : await getAuthHeaders();

  try {
    response = await fetch(buildUrl(path), {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
    });
  } catch (error) {
    console.log('[apiClient] API network error', {
      path,
      message: error?.message,
      name: error?.name,
    });
    throw error;
  }

  if (!response.ok) {
    const body = await response.text();
    console.log('[apiClient] API response error', {
      path,
      status: response.status,
      statusText: response.statusText,
      body,
    });
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  AuthRequiredError,
  request,
  get: (path, options = {}) => request(path, options),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};
