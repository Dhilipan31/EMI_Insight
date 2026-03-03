/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

/**
 * Validate EMI payment day (1-28)
 */
export const isValidEmiPayDay = (day) => {
  const dayNum = parseInt(day)
  return dayNum >= 1 && dayNum <= 28
}

/**
 * Validate positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
}

/**
 * Validate non-negative number
 */
export const isNonNegativeNumber = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (date) => {
  if (!date) return false
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj)
}

/**
 * Check if amount is within range
 */
export const isAmountInRange = (amount, min, max) => {
  const num = parseFloat(amount)
  return num >= min && num <= max
}
