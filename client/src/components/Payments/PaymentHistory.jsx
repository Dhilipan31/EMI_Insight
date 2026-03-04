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
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && hasPayments && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-800 border-b border-dark-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-dark-text">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-dark-text">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-dark-text">Principal</th>
                    <th className="text-left px-4 py-3 font-semibold text-dark-text">Interest</th>
                    <th className="text-left px-4 py-3 font-semibold text-dark-text">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {visiblePayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-dark-800/50 transition">
                      <td className="px-4 py-3 text-dark-text">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-dark-text">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-dark-text-secondary">
                        {formatCurrency(payment.principalPaid)}
                      </td>
                      <td className="px-4 py-3 text-dark-text-secondary">
                        {formatCurrency(payment.interestPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.type === 'EMI'
                              ? 'badge-info'
                              : 'badge-active'
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
                  className="text-primary-500 hover:text-primary-400 text-sm font-medium transition"
                >
                  {showAll
                    ? 'Show Less'
                    : `See More (${paymentHistory.length - 5} more)`}
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-dark-700 pt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-dark-text-secondary">Total Paid</p>
                <p className="text-lg font-bold text-dark-text">
                  {formatCurrency(
                    paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-dark-text-secondary">Principal Paid</p>
                <p className="text-lg font-bold text-dark-text">
                  {formatCurrency(
                    paymentHistory.reduce((sum, p) => sum + (p.principalPaid || 0), 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-dark-text-secondary">Interest Paid</p>
                <p className="text-lg font-bold text-dark-text">
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
            <p className="text-dark-text-secondary mb-4">No payment history yet</p>
            <p className="text-sm text-dark-text-secondary">
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