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
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
              <p className="text-gray-600">Comprehensive overview of your loans and payments</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Borrowed</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBorrowed)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Repaid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRepaid)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Monthly EMI</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyEmi)}</p>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
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
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Loan Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Principal</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Outstanding</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Monthly EMI</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Interest Rate</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loans.map((loan) => {
                      const progress = loan.principal
                        ? ((loan.principal - loan.remainingPrincipal) / loan.principal) * 100
                        : 0
                      return (
                        <tr key={loan.loanId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{loan.name}</td>
                          <td className="px-4 py-3 text-gray-700">{formatCurrency(loan.principal)}</td>
                          <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(loan.remainingPrincipal)}</td>
                          <td className="px-4 py-3 text-blue-600 font-semibold">{formatCurrency(loan.emi)}</td>
                          <td className="px-4 py-3 text-gray-700">{loan.interestRate}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">{Math.round(progress)}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary */}
              <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Total Borrowed</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalBorrowed)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Total Repaid</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalRepaid)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Total Outstanding</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Total Interest Paid</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(totalInterest)}</p>
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
