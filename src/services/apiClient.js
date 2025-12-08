import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const STORAGE_KEYS = {
  admin: 'pw_admin_token',
  user: 'pw_user_token',
  instructor: 'pw_instructor_token',
}

const envToken = (authType) => {
  if (!authType) return ''
  const key = `VITE_${authType.toUpperCase()}_TOKEN`
  return import.meta.env[key] || ''
}

export const getStoredToken = (authType) => {
  if (typeof window === 'undefined' || !authType) return envToken(authType)
  return window.localStorage.getItem(STORAGE_KEYS[authType]) || envToken(authType)
}

export const persistToken = (authType, token) => {
  if (typeof window === 'undefined' || !authType) return
  window.localStorage.setItem(STORAGE_KEYS[authType], token)
}

export const clearToken = (authType) => {
  if (typeof window === 'undefined' || !authType) return
  window.localStorage.removeItem(STORAGE_KEYS[authType])
}

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.payload = options.payload
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export const apiRequest = async ({ endpoint, method = 'get', params, data, authType, headers = {} }) => {
  if (!endpoint) {
    throw new ApiError('Endpoint is required')
  }

  const requestConfig = {
    url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
    method,
    params,
    data,
    headers: { ...headers },
  }

  if (authType) {
    const token = getStoredToken(authType)
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }
  }

  try {
    const response = await client(requestConfig)
    return response.data
  } catch (error) {
    const status = error.response?.status
    const payload = error.response?.data
    const message = payload?.message || error.message || 'API request failed'
    throw new ApiError(message, { status, payload })
  }
}

export default client

