/**
 * API Client Configuration
 * Centralized API client for the NestJS backend
 */

// Get API base URL from environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

/**
 * API client class for making requests to the NestJS backend
 */
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Make a GET request
   */
  async get<T>(
    path: string,
    options?: RequestInit & { siteKey?: string; [key: string]: any }
  ): Promise<T> {
    const { siteKey, ...restOptions } = options || {}
    const {
      headers,
      method,
      body,
      cache,
      credentials,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal,
      ...queryParams
    } = restOptions

    // Build query string from queryParams
    const queryString = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert dateFilter from uppercase to lowercase (backend expects lowercase)
        if (key === 'dateFilter' && typeof value === 'string') {
          queryString.append(key, value.toLowerCase())
        } else if (Array.isArray(value)) {
          value.forEach((v) => queryString.append(key, String(v)))
        } else {
          queryString.append(key, String(value))
        }
      }
    })

    const queryStringStr = queryString.toString()
    const url = `${this.baseUrl}${path}${queryStringStr ? `?${queryStringStr}` : ''}`

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Add X-Site-Key header if siteKey is provided
    if (siteKey) {
      requestHeaders['X-Site-Key'] = siteKey
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include cookies for session
      headers: requestHeaders,
      cache,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.message || `API request failed: ${response.statusText}`
      console.error(`API Error [${path}]:`, errorMessage, response.status)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  }

  /**
   * Make a POST request
   */
  async post<T>(
    path: string,
    data?: any,
    options?: RequestInit & { siteKey?: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    }

    // Add X-Site-Key header if siteKey is provided
    if (options?.siteKey) {
      headers['X-Site-Key'] = options.siteKey
    }

    const response = await fetch(url, {
      ...options,
      method: 'POST',
      credentials: 'include',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API request failed: ${response.statusText}`
      )
    }

    return response.json()
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API request failed: ${response.statusText}`
      )
    }

    return response.json()
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API request failed: ${response.statusText}`
      )
    }

    // DELETE may return no content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export API base URL for direct use
export const API_URL = API_BASE_URL
