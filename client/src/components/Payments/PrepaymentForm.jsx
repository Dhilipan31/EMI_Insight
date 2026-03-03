import { useState } from 'react'
import { Card, Button, Input, Alert, Select } from '../Common'
import { usePayment } from '../../hooks/usePayment'
import { formatCurrency } from '../../utils/formatters'

/**
 * PrepaymentForm Component - Make prepayment on loan
 */
export const PrepaymentForm = ({ loan, onSuccess }) => {
  const { addPrepayment, isLoading, error } = usePayment()
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('TENURE_REDUCTION')
  const [alert, setAlert] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateAmount = () => {
    const parsedAmount = parseFloat(amount)
    if (!amount || parsedAmount <= 0) {
      setAlert({ type: 'error', message: 'Amount must be greater than 0' })
      return false
    }
    if (parsedAmount > loan.outstandingBalance) {
      setAlert({ type: 'error', message: `Amount cannot exceed outstanding balance (${formatCurrency(loan.outstandingBalance)})` })
      return false
    }
    return true
  }

  const handlePrepayment = async () => {
    try {
      await addPrepayment(loan.loanId, {
        amount: parseFloat(amount),
        mode: mode,
        paymentDate : new Date()
      })

      setAlert({ type: 'success', message: 'Prepayment successful!' })
      setTimeout(() => {
        onSuccess?.()
        setShowConfirmation(false)
        setAmount('')
      }, 1000)
    } catch (err) {
      setAlert({ type: 'error', message: error || 'Prepayment failed' })
    }
  }

  const newOutstanding = loan.outstandingBalance - parseFloat(amount || 0)
  const interestSavings = (loan.emi * loan.amortizationSummary.remainingInstallments) * (parseFloat(amount || 0) / loan.outstandingBalance)

  if (showConfirmation) {
    return (
      <Card className="bg-green-50 border border-green-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Prepayment</h3>
            <p className="text-sm text-gray-600">Review your prepayment details</p>
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
              <span className="text-gray-600">Prepayment Amount:</span>
              <span className="font-bold text-gray-900">{formatCurrency(parseFloat(amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-bold text-gray-900">{mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Outstanding:</span>
              <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-gray-600">New Outstanding:</span>
              <span className="font-bold text-green-600">{formatCurrency(Math.max(0, newOutstanding))}</span>
            </div>
            {interestSavings > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Interest Saved:</span>
                <span className="font-bold text-green-600">{formatCurrency(interestSavings)}</span>
              </div>
            )}
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
              onClick={handlePrepayment}
              isLoading={isLoading}
              fullWidth
            >
              Confirm Prepayment
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Prepayment</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Outstanding Balance:</span>
          <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Remaining EMI Months:</span>
          <span className="font-bold text-gray-900">{loan.amortizationSummary.remainingInstallments}</span>
        </div>
      </div>

      <Input
        label="Prepayment Amount (₹)"
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        helperText={`Max: ${formatCurrency(loan.outstandingBalance)}`}
        required
      />

      <Select
        label="Prepayment Mode"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        options={[
          { value: 'TENURE_REDUCTION', label: 'Tenure Reduction (Faster payoff)' },
          { value: 'EMI_REDUCTION', label: 'EMI Reduction (Lower monthly amount)' },
        ]}
        required
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900 space-y-2">
        <p className="font-semibold">ℹ️ Mode Explanation</p>
        {mode === 'TENURE_REDUCTION' ? (
          <p>Your monthly EMI remains the same, but you'll finish paying in fewer months, saving on interest.</p>
        ) : (
          <p>Your loan duration remains the same, but your monthly EMI amount will be reduced.</p>
        )}
      </div>

      <Button
        onClick={() => {
          if (validateAmount()) {
            setShowConfirmation(true)
          }
        }}
        isLoading={isLoading}
        fullWidth
      >
        Review Prepayment
      </Button>
    </Card>
  )
}

export default PrepaymentForm
