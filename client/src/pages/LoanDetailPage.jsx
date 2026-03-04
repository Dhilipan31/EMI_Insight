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
      <div className="flex h-screen bg-dark-900">
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
      <div className="flex h-screen bg-dark-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-4">
            <Card>
              <div className="text-center space-y-4">
                <p className="text-dark-text-secondary">Loan not found</p>
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
        return 'badge-active'
      case 'CLOSED':
        return 'badge-closed'
      default:
        return 'badge-info'
    }
  }

  const tabs = [
    { id: 'payment', label: 'Make EMI Payment', icon: '💳' },
    { id: 'prepayment', label: 'Prepayment', icon: '⚡' },
    { id: 'simulate', label: 'Simulate', icon: '📊' },
    { id: 'history', label: 'Payment History', icon: '📋' },
  ]

  return (
    <div className="flex h-screen bg-dark-900">
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
                <h1 className="text-3xl font-bold text-dark-text">{loan.name}</h1>
                <p className="text-dark-text-secondary">Loan ID: {loan.loanId}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor()}`}>
                {loan.loanStatus}
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Principal Amount</p>
                  <p className="text-2xl font-bold text-dark-text">{formatCurrency(loan.principal)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(loan.outstandingBalance)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Monthly EMI</p>
                  <p className="text-2xl font-bold text-primary-500">{formatCurrency(loan.amortizationSummary.emi)}</p>
                  <p className="text-xs text-dark-text-secondary">{loan.interestRate}% p.a.</p>
                </div>
              </Card>
            </div>

            {/* Progress Section */}
            <Card title="Loan Progress">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-dark-text-secondary">Repayment Progress</p>
                    <p className="text-sm font-bold text-dark-text">{Math.round(progressPercent)}%</p>
                  </div>
                  <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dark-700">
                  <div>
                    <p className="text-xs text-dark-text-secondary">EMI Paid</p>
                    <p className="text-lg font-bold">{loan.emiPaidCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-text-secondary">Total EMI</p>
                    <p className="text-lg font-bold">{loan.tenureMonths}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-text-secondary">Remaining</p>
                    <p className="text-lg font-bold">{loan.amortizationSummary.remainingInstallments || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-text-secondary">Total Interest</p>
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
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-primary-500'
                }`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-dark-text-secondary">Next Payment Date</p>
                    <p className="text-lg font-bold text-dark-text">{formatDate(loan.nextPaymentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Days Until Payment</p>
                    <p className={`text-lg font-bold ${daysUntilPayment && daysUntilPayment <= 5 ? 'text-red-400' : 'text-dark-text'}`}>
                      {daysUntilPayment !== null ? `${daysUntilPayment} days` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">EMI Pay Day</p>
                    <p className="text-lg font-bold text-dark-text">{loan.emiPayDay}</p>
                  </div>
                  {loan.lastPaymentDate && (
                    <div>
                      <p className="text-sm text-dark-text-secondary">Last Payment</p>
                      <p className="text-lg font-bold text-dark-text">{formatDate(loan.lastPaymentDate)}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Tabs */}
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-dark-700 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-primary-500 border-primary-500'
                        : 'text-dark-text-secondary border-transparent hover:text-dark-text'
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
