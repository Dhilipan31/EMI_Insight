import { useState, useCallback } from 'react'
import { paymentService } from '../services'
import { useApi } from './useApi'

/**
 * Custom hook for payment operations
 */
export const usePayment = () => {
  const { isLoading, error, execute, clearError } = useApi()
  const [paymentHistory, setPaymentHistory] = useState([])
  const [simulationResult, setSimulationResult] = useState(null)

  const addEmiPayment = useCallback(async (loanId, paymentData) => {
    try {
      const data = await execute(() => paymentService.addEmiPayment(loanId, paymentData))
      return data
    } catch (err) {
      console.error('Failed to add EMI payment:', err)
      throw err
    }
  }, [execute])

  const addPrepayment = useCallback(async (loanId, prepaymentData) => {
    try {
      const data = await execute(() => paymentService.addPrepayment(loanId, prepaymentData))
      return data
    } catch (err) {
      console.error('Failed to add prepayment:', err)
      throw err
    }
  }, [execute])

  const simulatePrepayment = useCallback(async (loanId, amount) => {
    try {
      const data = await execute(() => paymentService.simulatePrepayment(loanId, { extraAmount: amount }))
      setSimulationResult(data)
      return data
    } catch (err) {
      console.error('Failed to simulate prepayment:', err)
      throw err
    }
  }, [execute])

  const getPaymentHistory = useCallback(async (loanId) => {
    try {
      const data = await execute(() => paymentService.getPaymentHistory(loanId))
      setPaymentHistory(data)
      console.log('Fetched payment history:', data)
      return data
    } catch (err) {
      console.error('Failed to fetch payment history:', err)
    }
  }, [execute])

  return {
    paymentHistory,
    simulationResult,
    isLoading,
    error,
    addEmiPayment,
    addPrepayment,
    simulatePrepayment,
    getPaymentHistory,
    clearError,
  }
}
