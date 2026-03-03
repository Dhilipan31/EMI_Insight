import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../Common'
import { formatCurrency, formatDate } from '../../utils/formatters'

/**
 * LoanCard Component - Displays individual loan summary
 */
export const LoanCard = ({ loan }) => {
  const navigate = useNavigate()

  // Calculate progress percentage
  const progressPercent = loan.principal
    ? Math.min(100, ((loan.principal - loan.remainingPrincipal) / loan.principal) * 100)
    : 0

  // Get status color
  const getStatusColor = () => {
    switch (loan.loanStatus) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilPayment = () => {
    if (!loan.nextPaymentDate) return null
    const today = new Date()
    const payment = new Date(loan.nextPaymentDate)
    const days = Math.ceil((payment - today) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  return (
    <Card className="hover:shadow-lg transition">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{loan.name}</h3>
            <p className="text-sm text-gray-500">
              {loan.principal ? formatCurrency(loan.principal) : 'N/A'} • {loan.interestRate}% p.a.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
            {loan.loanStatus}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Outstanding Balance</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(loan.remainingPrincipal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Monthly EMI</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.emi)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Progress</p>
            <p className="text-xs font-semibold text-gray-700">{Math.round(progressPercent)}%</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Payment Info */}
        {loan.loanStatus === 'ACTIVE' && loan.nextPaymentDate && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-900">Next Payment</p>
            <p className="text-sm font-semibold text-blue-900">{formatDate(loan.nextPaymentDate)}</p>
            <p className="text-xs text-blue-700">{getDaysUntilPayment()} days remaining</p>
          </div>
        )}

        {/* EMI Paid Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {loan.emiPaidCount || 0} / {loan.tenureMonths || '?'} EMI paid
          </span>
          <span className="text-gray-700 font-semibold">
            {loan.remainingEmiMonth ? `${loan.remainingEmiMonth} months left` : 'Completed'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate(`/loan/${loan.loanId}`)}
            variant="primary"
            size="sm"
            fullWidth
          >
            View Details
          </Button>
          {loan.loanStatus === 'ACTIVE' && (
            <Button
              onClick={() => navigate(`/loan/${loan.loanId}`)}
              variant="outline"
              size="sm"
              fullWidth
            >
              Pay EMI
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default LoanCard
