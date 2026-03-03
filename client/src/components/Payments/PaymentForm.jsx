import { useState } from 'react'
import { Card, Button, Input, DatePicker, Alert } from '../Common'
import { usePayment } from '../../hooks/usePayment'
import { formatCurrency, formatDate } from '../../utils/formatters'

/**
 * PaymentForm Component - Make EMI payment
 */
export const PaymentForm = ({ loan, onSuccess }) => {
  const { addEmiPayment, isLoading, error } = usePayment()
  const [paymentDate, setPaymentDate] = useState(loan.nextPaymentDate || '')
  const [alert, setAlert] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handlePayment = async () => {
    if (!paymentDate) {
      setAlert({ type: 'error', message: 'Please select payment date' })
      return
    }

    try {
      await addEmiPayment(loan.loanId, {
        amount: loan.amortizationSummary.emi,
        paymentDate: paymentDate,
        type: 'EMI',
      })

      setAlert({ type: 'success', message: 'Payment successful!' })
      setTimeout(() => {
        onSuccess?.()
        setShowConfirmation(false)
      }, 1000)
    } catch (err) {
      setAlert({ type: 'error', message: error || 'Payment failed' })
    }
  }

  if (showConfirmation) {
    return (
      <Card className="bg-blue-50 border border-blue-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
            <p className="text-sm text-gray-600">Please review the payment details</p>
          </div>

          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
              autoDismiss={alert.type === 'success'}
            />
          )}

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Amount:</span>
              <span className="font-bold text-gray-900">{formatCurrency(loan.amortizationSummary.emi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-bold text-gray-900">{formatDate(paymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Balance:</span>
              <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-gray-600">After Payment:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(Math.max(0, loan.outstandingBalance - loan.amortizationSummary.emi))}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              isLoading={isLoading}
              fullWidth
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          autoDismiss={alert.type === 'success'}
        />
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Make EMI Payment</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">EMI Amount:</span>
          <span className="font-bold text-gray-900">{formatCurrency(loan.amortizationSummary.emi)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Scheduled Date:</span>
          <span className="font-bold text-gray-900">{formatDate(loan.nextPaymentDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Outstanding:</span>
          <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
        </div>
      </div>

      <DatePicker
        label="Payment Date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
        helperText={`Must match scheduled date: ${formatDate(loan.nextPaymentDate)}`}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">⚠️ Important</p>
        <p>Payment can only be made on the scheduled date. Select the exact payment date to proceed.</p>
      </div>

      <Button
        onClick={() => setShowConfirmation(true)}
        isLoading={isLoading}
        fullWidth
      >
        Proceed to Payment
      </Button>
    </Card>
  )
}

export default PaymentForm
