import { useState, useEffect } from 'react'
import { useLoan } from '../hooks/useLoan'
import { TopBar, Sidebar, Card, Loading } from '../components/Common'
import { formatCurrency } from '../utils/formatters'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * AnalyticsPage - Comprehensive financial overview with charts
 */
function AnalyticsPage() {
  const { loans, isLoading, getAllLoans } = useLoan()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getAllLoans()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dark-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <Loading message="Loading analytics..." />
          </div>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalBorrowed = loans.reduce((sum, loan) => sum + (loan.principal || 0), 0)
  const totalRepaid = loans.reduce((sum, loan) => sum + ((loan.principal || 0) - (loan.remainingPrincipal || 0)), 0)
  const totalOutstanding = loans.reduce((sum, loan) => sum + (loan.remainingPrincipal || 0), 0)
  const totalInterest = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0)
  const totalMonthlyEmi = loans.reduce((sum, loan) => sum + (loan.emi || 0), 0)

  // Chart data
  const loanDistributionData = loans.map((loan) => ({
    name: loan.name,
    value: loan.remainingPrincipal || 0,
    outstanding: loan.remainingPrincipal || 0,
  }))

  const loanComparisonData = loans.map((loan) => ({
    name: loan.name,
    outstanding: loan.remainingPrincipal || 0,
    emi: loan.emi || 0,
    interest: loan.interestRate || 0,
  }))

  const Colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-dark-text">Financial Analytics</h1>
              <p className="text-dark-text-secondary">Comprehensive overview of your loans and payments</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Total Borrowed</p>
                  <p className="text-2xl font-bold text-dark-text">{formatCurrency(totalBorrowed)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Total Repaid</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRepaid)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(totalOutstanding)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-dark-text-secondary">Total Monthly EMI</p>
                  <p className="text-2xl font-bold text-primary-500">{formatCurrency(totalMonthlyEmi)}</p>
                </div>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Distribution Pie Chart */}
              {loanDistributionData.length > 0 && (
                <Card title="Loan Distribution by Outstanding Balance">
                  <div className="flex justify-center h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={loanDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {loanDistributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Loan Comparison Bar Chart */}
              {loanComparisonData.length > 0 && (
                <Card title="Loan Comparison - Outstanding vs EMI">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={loanComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="rgba(165,165,165,0.6)" />
                        <YAxis stroke="rgba(165,165,165,0.6)" />
                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2d2d2d' }} />
                        <Legend />
                        <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding Balance" />
                        <Bar dataKey="emi" fill="#3b82f6" name="Monthly EMI" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

            {/* Summary Table */}
            <Card title="Detailed Loan Summary">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-800 border-b border-dark-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Loan Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Principal</th>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Outstanding</th>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Monthly EMI</th>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Interest Rate</th>
                      <th className="text-left px-4 py-3 font-semibold text-dark-text">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {loans.map((loan) => {
                      const progress = loan.principal
                        ? ((loan.principal - loan.remainingPrincipal) / loan.principal) * 100
                        : 0
                      return (
                        <tr key={loan.loanId} className="hover:bg-dark-800/50 transition">
                          <td className="px-4 py-3 font-medium text-dark-text">{loan.name}</td>
                          <td className="px-4 py-3 text-dark-text-secondary">{formatCurrency(loan.principal)}</td>
                          <td className="px-4 py-3 text-red-400 font-semibold">{formatCurrency(loan.remainingPrincipal)}</td>
                          <td className="px-4 py-3 text-primary-500 font-semibold">{formatCurrency(loan.emi)}</td>
                          <td className="px-4 py-3 text-dark-text-secondary">{loan.interestRate}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-dark-text-secondary">{Math.round(progress)}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary */}
              <div className="border-t border-dark-700 pt-4 mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Total Borrowed</p>
                  <p className="text-lg font-bold text-dark-text">{formatCurrency(totalBorrowed)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Total Repaid</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(totalRepaid)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Total Outstanding</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Total Interest Paid</p>
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
