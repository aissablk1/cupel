// Forgekit CLI — client API
import { request } from 'undici';
import { config } from './config.js';

interface APIError {
  error: string;
  code?: string;
}

async function call<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const token = config.get('token');
  const apiUrl = config.get('apiUrl');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'user-agent': 'forgekit-cli/0.0.1',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await request(`${apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.body.json()) as T | APIError;
  if (res.statusCode >= 400) {
    throw new Error(`API ${res.statusCode}: ${(data as APIError).error ?? 'Unknown error'}`);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => call<T>('GET', path),
  post: <T>(path: string, body?: unknown) => call<T>('POST', path, body),
  delete: <T>(path: string) => call<T>('DELETE', path),
};
