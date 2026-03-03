import { useEffect, useState } from 'react'
import { Card, Loading } from '../Common'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { usePayment } from '../../hooks/usePayment'

/**
 * PaymentHistory Component - Display payment history table
 */
export const PaymentHistory = ({ loan }) => {
  const { paymentHistory, isLoading, error, getPaymentHistory } = usePayment()

  const [showAll, setShowAll] = useState(false)

  // Fetch payments when loan changes
  useEffect(() => {
    if (loan?.loanId) {
      getPaymentHistory(loan.loanId)
      setShowAll(false) // Reset when switching loans
    }
  }, [loan?.loanId])

  const hasPayments = paymentHistory?.length > 0
  const hasMore = paymentHistory?.length > 5

  const visiblePayments = showAll
    ? paymentHistory
    : paymentHistory?.slice(0, 5)

  return (
    <Card title="Payment History">
      <div className="space-y-4">

        {/* Loading */}
        {isLoading && <Loading message="Loading payment history..." />}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && hasPayments && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Principal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Interest</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visiblePayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatCurrency(payment.principalPaid)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatCurrency(payment.interestPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.type === 'EMI'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {payment.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* See More / Show Less */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showAll
                    ? 'Show Less'
                    : `See More (${paymentHistory.length - 5} more)`}
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Total Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Principal Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    paymentHistory.reduce((sum, p) => sum + (p.principalPaid || 0), 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Interest Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    paymentHistory.reduce((sum, p) => sum + (p.interestPaid || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasPayments && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No payment history yet</p>
            <p className="text-sm text-gray-500">
              Payments will appear here once you make the first EMI payment on{' '}
              {formatDate(loan?.nextPaymentDate)}
            </p>
          </div>
        )}

      </div>
    </Card>
  )
}

export default PaymentHistory