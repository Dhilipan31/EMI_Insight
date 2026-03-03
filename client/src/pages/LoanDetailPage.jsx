import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLoan } from '../hooks/useLoan'
import { TopBar, Sidebar, Card, Button, Loading, Alert } from '../components/Common'
import { formatCurrency, formatDate } from '../utils/formatters'
import { PaymentForm } from '../components/Payments/PaymentForm'
import { PrepaymentForm } from '../components/Payments/PrepaymentForm'
import { SimulationPanel } from '../components/Payments/SimulationPanel'
import { PaymentHistory } from '../components/Payments/PaymentHistory'

/**
 * LoanDetailPage - Detailed view of a specific loan with payment options
 */
function LoanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loanDetail, isLoading, getLoanById } = useLoan()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('payment')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    getLoanById(id)
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <Loading message="Loading loan details..." />
          </div>
        </div>
      </div>
    )
  }

  if (!loanDetail) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-4">
            <Card>
              <div className="text-center space-y-4">
                <p className="text-gray-600">Loan not found</p>
                <Button onClick={() => navigate('/home')}>Go Back</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const loan = loanDetail

  // Calculate metrics
  const progressPercent = loan.principal
    ? Math.min(100, ((loan.principal - loan.outstandingBalance) / loan.principal) * 100)
    : 0

  const daysUntilPayment = loan.nextPaymentDate
    ? Math.ceil((new Date(loan.nextPaymentDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

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

  const tabs = [
    { id: 'payment', label: 'Make EMI Payment', icon: '💳' },
    { id: 'prepayment', label: 'Prepayment', icon: '⚡' },
    { id: 'simulate', label: 'Simulate', icon: '📊' },
    { id: 'history', label: 'Payment History', icon: '📋' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                autoDismiss={alert.type === 'success'}
              />
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/home')} variant="ghost" size="sm">
                ← Back
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{loan.name}</h1>
                <p className="text-gray-600">Loan ID: {loan.loanId}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor()}`}>
                {loan.loanStatus}
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Principal Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.principal)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Monthly EMI</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(loan.amortizationSummary.emi)}</p>
                  <p className="text-xs text-gray-500">{loan.interestRate}% p.a.</p>
                </div>
              </Card>
            </div>

            {/* Progress Section */}
            <Card title="Loan Progress">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Repayment Progress</p>
                    <p className="text-sm font-bold text-gray-900">{Math.round(progressPercent)}%</p>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">EMI Paid</p>
                    <p className="text-lg font-bold">{loan.emiPaidCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total EMI</p>
                    <p className="text-lg font-bold">{loan.tenureMonths}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className="text-lg font-bold">{loan.amortizationSummary.remainingInstallments || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Interest</p>
                    <p className="text-lg font-bold">{formatCurrency(loan.interestPaid || 0)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Schedule */}
            {loan.loanStatus === 'ACTIVE' && (
              <Card
                title="Payment Schedule"
                className={`border-l-4 ${
                  daysUntilPayment && daysUntilPayment <= 5
                    ? 'border-red-500 bg-red-50'
                    : 'border-blue-500'
                }`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Next Payment Date</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(loan.nextPaymentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Until Payment</p>
                    <p className={`text-lg font-bold ${daysUntilPayment && daysUntilPayment <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {daysUntilPayment !== null ? `${daysUntilPayment} days` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">EMI Pay Day</p>
                    <p className="text-lg font-bold text-gray-900">{loan.emiPayDay}</p>
                  </div>
                  {loan.lastPaymentDate && (
                    <div>
                      <p className="text-sm text-gray-600">Last Payment</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(loan.lastPaymentDate)}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Tabs */}
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-fadeIn">
                {activeTab === 'payment' && loan.loanStatus === 'ACTIVE' && (
                  <PaymentForm loan={loan} onSuccess={() => {
                    setAlert({ type: 'success', message: 'Payment successful!' })
                    getLoanById(id)
                  }} />
                )}
                {activeTab === 'prepayment' && loan.loanStatus === 'ACTIVE' && (
                  <PrepaymentForm loan={loan} onSuccess={() => {
                    setAlert({ type: 'success', message: 'Prepayment successful!' })
                    getLoanById(id)
                  }} />
                )}
                {activeTab === 'simulate' && loan.loanStatus === 'ACTIVE' && (
                  <SimulationPanel loan={loan} />
                )}
                {activeTab === 'history' && (
                  <PaymentHistory loan={loan} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoanDetailPage
