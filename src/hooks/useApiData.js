import { useState, useEffect } from 'react'

/**
 * Custom hook for managing API data fetching with loading and error states
 * @param {Function} fetchFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApiData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchFunction()
      const responseData = response.data?.data || response.data || []
      setData(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

