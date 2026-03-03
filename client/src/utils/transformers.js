/**
 * Data transformation utilities
 */

/**
 * Convert snake_case to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

/**
 * Convert object keys from snake_case to camelCase recursively
 */
export const transformSnakeToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(transformSnakeToCamel)
  } else if (obj !== null && obj.constructor === Object) {
    const transformed = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key)
        transformed[camelKey] = transformSnakeToCamel(obj[key])
      }
    }
    return transformed
  }
  return obj
}

/**
 * Transform loan data from backend to frontend format
 */
export const transformLoanData = (loan) => {
  return transformSnakeToCamel(loan)
}

/**
 * Transform array of loans
 */
export const transformLoansData = (loans) => {
  if (!Array.isArray(loans)) return loans
  return loans.map(transformSnakeToCamel)
}
