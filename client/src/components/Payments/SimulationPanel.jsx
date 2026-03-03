import { useState } from 'react'
import { Card, Button, Input, Alert, Loading } from '../Common'
import { usePayment } from '../../hooks/usePayment'
import { formatCurrency } from '../../utils/formatters'

/**
 * SimulationPanel Component - Simulate prepayment scenarios with recommendations
 */
export const SimulationPanel = ({ loan }) => {
  const { simulatePrepayment, simulationResult, isLoading } = usePayment()
  const [amount, setAmount] = useState('')
  const [alert, setAlert] = useState(null)

  const handleSimulate = async () => {
    const parsedAmount = parseFloat(amount)

    if (!amount || parsedAmount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount' })
      return
    }

    if (parsedAmount > loan.outstandingBalance) {
      setAlert({ type: 'error', message: `Amount cannot exceed outstanding balance (${formatCurrency(loan.outstandingBalance)})` })
      return
    }

    try {
      await simulatePrepayment(loan.loanId, parsedAmount)
      setAlert({ type: 'success', message: 'Simulation completed!' })
    } catch (err) {
      setAlert({ type: 'error', message: 'Simulation failed' })
    }
  }

  return (
    <div className="space-y-4">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          autoDismiss={alert.type === 'success'}
        />
      )}

      {/* Input Section */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Simulation Setup</h3>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Outstanding:</span>
              <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly EMI:</span>
              <span className="font-bold text-gray-900">{formatCurrency(loan.amortizationSummary.emi)}</span>
            </div>
          </div>

          <Input
            label="Prepayment Amount (₹)"
            type="number"
            placeholder="Enter amount to simulate"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={`Max: ${formatCurrency(loan.outstandingBalance)}`}
          />

          <Button
            onClick={handleSimulate}
            isLoading={isLoading}
            fullWidth
          >
            Simulate Prepayment
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {isLoading && <Loading message="Running simulation..." />}

      {simulationResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Recommendation Card */}
          <Card className={`border-l-4 ${
            simulationResult.recommendation === 'TENURE_REDUCTION'
              ? 'border-blue-500 bg-blue-50'
              : 'border-green-500 bg-green-50'
          }`}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Recommendation</h3>
                  <p className="text-sm text-gray-600">{simulationResult.reason}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  simulationResult.recommendation === 'TENURE_REDUCTION'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-green-200 text-green-900'
                }`}>
                  {simulationResult.recommendation}
                </span>
              </div>
            </div>
          </Card>

          {/* Comparison Table */}
          <Card title="Impact Analysis">
            <div className="space-y-4">
              {/* Current Scenario */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Scenario</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-600">Outstanding Balance</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.outstandingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Monthly EMI</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.amortizationSummary.emi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Remaining Months</p>
                    <p className="text-lg font-bold text-gray-900">{loan.amortizationSummary.remainingInstallments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Cost</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency((loan.amortizationSummary.emi * loan.amortizationSummary.remainingInstallments) + loan.outstandingBalance - loan.amortizationSummary.principalPaid)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated Scenario */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">After Prepayment of {formatCurrency(amount)}</h4>
                <div className="grid grid-cols-2 gap-4 bg-green-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-600">Outstanding Balance</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(simulationResult.newOutstanding || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Monthly EMI</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(simulationResult.newEmi || loan.amortizationSummary.emi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Remaining Months</p>
                    <p className="text-lg font-bold text-green-700">{simulationResult.newRemainingMonths || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Interest Saved</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(simulationResult.interestSaved || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {simulationResult.monthsReduced > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">💡 You can save {formatCurrency(simulationResult.interestSaved || 0)}</span> in interest
                    by prepaying {formatCurrency(amount)} now!
                    Debt-free date: <span className="font-bold">{simulationResult.newClosingDate || 'N/A'}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SimulationPanel
