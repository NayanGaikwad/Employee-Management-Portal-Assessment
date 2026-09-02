const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? '/api'

export const TOKEN_STORAGE_KEY = 'employee-portal.token'
export const AUTH_EXPIRED_EVENT = 'employee-portal:unauthorized'

export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
  timestamp?: string
  path?: string
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly error?: string
  readonly path?: string

  constructor(body: ApiErrorBody) {
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message

    super(message, { cause: body })
    this.name = 'ApiError'
    this.statusCode = body.statusCode
    this.error = body.error
    this.path = body.path
  }

  get friendlyMessage(): string {
    switch (this.statusCode) {
      case 400:
        return this.message || 'The request data was invalid.'
      case 401:
        return 'Your session has expired. Please sign in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return this.message || 'The requested resource was not found.'
      case 409:
        return this.message || 'A record with this value already exists.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  /** The raw message returned by the server (untranslated). */
  get rawMessage(): string {
    return this.message
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

function notifyUnauthorized(): void {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

function buildQueryString(params?: object): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item))
    } else {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  params?: object
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, body } = options
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({
      statusCode: 0,
      message: 'Unable to reach the server. Please check your connection.',
      error: 'Network Error',
    })
  }

  const text = await response.text()
  const payload = text ? safeParse(text) : null

  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized()
    const errorBody: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText,
      error: response.statusText,
    }
    if (payload && typeof payload === 'object') {
      const candidate = payload as Partial<ApiErrorBody>
      if (typeof candidate.message === 'string' || Array.isArray(candidate.message)) {
        errorBody.message = candidate.message as string | string[]
      }
      if (typeof candidate.error === 'string') errorBody.error = candidate.error
      if (typeof candidate.path === 'string') errorBody.path = candidate.path
    }
    throw new ApiError(errorBody)
  }

  return payload as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>(path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}