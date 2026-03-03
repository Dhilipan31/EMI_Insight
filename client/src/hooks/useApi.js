import { useState } from 'react'

/**
 * Generic API hook for making requests with loading and error state
 */
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (apiCall, onSuccess) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      onSuccess && onSuccess(response?.data || response)
      return response?.data || response
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return { isLoading, error, execute, clearError }
}
