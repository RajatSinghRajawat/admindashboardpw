import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/apiClient'

const normalizeToArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  if (payload?.data && Array.isArray(payload.data.items)) return payload.data.items
  return []
}

export const useCollection = ({ endpoint, params = {}, authType, enabled = true, initialData = null }) => {
  const [data, setData] = useState(initialData)
  const [items, setItems] = useState(normalizeToArray(initialData))
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState(null)

  const serializedParams = JSON.stringify(params || {})

  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) return
    setLoading(true)
    try {
      const response = await apiRequest({
        endpoint,
        params,
        authType,
      })
      setData(response)
      setItems(normalizeToArray(response))
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [endpoint, serializedParams, authType, enabled])

  useEffect(() => {
    if (enabled && endpoint) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [fetchData, endpoint, enabled])

  return {
    data,
    items,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useCollection

