/**
 * Date utility functions
 */

/**
 * Get days until a target date
 */
export const getDaysUntil = (targetDate) => {
  if (!targetDate) return null
  const today = new Date()
  const target = new Date(targetDate)
  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate > today
}

/**
 * Get next occurrence of a specific day of month
 */
export const getNextDayOfMonth = (dayOfMonth) => {
  const today = new Date()
  let nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth)

  if (nextDate <= today) {
    nextDate = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth)
  }

  return nextDate
}

/**
 * Format months remaining
 */
export const formatMonthsRemaining = (months) => {
  if (months <= 0) return 'Completed'
  if (months === 1) return '1 month'
  return `${months} months`
}

/**
 * Add months to a date
 */
export const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Get month name
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthIndex]
}
