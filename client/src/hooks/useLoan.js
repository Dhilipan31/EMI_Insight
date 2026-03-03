import { useState, useCallback } from 'react'
import { loanService } from '../services'
import { useApi } from './useApi'

/**
 * Custom hook for loan operations
 */
export const useLoan = () => {
  const { isLoading, error, execute, clearError } = useApi()
  const [loans, setLoans] = useState([])
  const [loanDetail, setLoanDetail] = useState(null)

  const getAllLoans = useCallback(async () => {
    try {
      const data = await execute(() => loanService.getAllLoans())
      setLoans(data || [])
      return data
    } catch (err) {
      console.error('Failed to fetch loans:', err)
    }
  }, [execute])

  const getLoanById = useCallback(async (id) => {
    try {
      const data = await execute(() => loanService.getLoanById(id))
      setLoanDetail(data)
      return data
    } catch (err) {
      console.error('Failed to fetch loan detail:', err)
    }
  }, [execute])

  const createLoan = useCallback(async (loanData) => {
    try {
      const data = await execute(() => loanService.createLoan(loanData))
      setLoans((prev) => [...prev, data])
      return data
    } catch (err) {
      console.error('Failed to create loan:', err)
    }
  }, [execute])

  return {
    loans,
    loanDetail,
    isLoading,
    error,
    getAllLoans,
    getLoanById,
    createLoan,
    clearError,
  }
}
