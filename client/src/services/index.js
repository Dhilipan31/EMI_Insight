import apiClient from './api'
import { transformSnakeToCamel, transformLoansData } from '../utils/transformers'

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
  // Register new user
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data)
    return transformSnakeToCamel(response.data)
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    })
    return transformSnakeToCamel(response.data)
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return transformSnakeToCamel(response.data)
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await apiClient.put('/auth/profile', data)
    return transformSnakeToCamel(response.data)
  },
}

/**
 * Loan Service
 * Handles all loan-related API calls
 */
export const loanService = {
  // Get all loans for user
  getAllLoans: async () => {
    const response = await apiClient.get('/loans/all')
    return transformLoansData(response.data)
  },

  // Get specific loan details
  getLoanById: async (loanId) => {
    const response = await apiClient.get(`/loans/${loanId}`)
    return transformSnakeToCamel(response.data)
  },

  // Create new loan
  createLoan: async (data) => {
    const response = await apiClient.post('/loans', data)
    return transformSnakeToCamel(response.data)
  },
}

/**
 * Payment Service
 * Handles all payment-related API calls
 */
export const paymentService = {
  // Make EMI payment
  addEmiPayment: async (loanId, data) => {
    const response = await apiClient.post(`/loans/${loanId}/payments`, data)
    return transformSnakeToCamel(response.data)
  },

  // Make prepayment
  addPrepayment: async (loanId, data) => {
    const response = await apiClient.post(`/loans/${loanId}/prepayment`, data)
    return transformSnakeToCamel(response.data)
  },

  // Simulate prepayment
  simulatePrepayment: async (loanId, extraAmount) => {
    const response = await apiClient.post(`/loans/${loanId}/simulate-prepayment`, extraAmount )
    return transformSnakeToCamel(response.data)
  },

  //Payment history  
  getPaymentHistory: async (loanId) => {
    const response = await apiClient.get(`/loans/${loanId}/paymenthistory`);
    return transformSnakeToCamel(response.data)
  },
}

/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */
export const dashboardService = {
  // Get dashboard overview
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard')
    return transformSnakeToCamel(response.data)
  },
}

export default {
  authService,
  loanService,
  paymentService,
  dashboardService,
}
