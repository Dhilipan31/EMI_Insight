import { useEffect, useState } from 'react'
import { Card, Loading } from '../Common'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { dashboardService } from '../../services'

/**
 * Dashboard Overview Component
 * Shows key financial metrics from backend dashboard endpoint
 */
export const DashboardOverview = () => {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await dashboardService.getDashboard()
      setDashboard(data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading message="Loading dashboard..." />
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border border-red-500/30">
        <p className="text-red-400">{error}</p>
      </Card>
    )
  }

  if (!dashboard) {
    return null
  }

  const stats = [
    {
      label: 'Outstanding Balance',
      value: formatCurrency(dashboard.totalOutstanding || 0),
      icon: '💰',
      color: 'blue',
    },
    {
      label: 'Monthly EMI',
      value: formatCurrency(dashboard.totalMonthlyEmi || 0),
      icon: '📊',
      color: 'green',
    },
    {
      label: 'Active Loans',
      value: dashboard.loanDistribution.length || 0,
      icon: '📋',
      color: 'purple',
    },
    {
      label: 'Debt-Free Date',
      value: dashboard.debtFreeDate ? formatDate(dashboard.debtFreeDate) : 'N/A',
      icon: '🎯',
      color: 'orange',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-dark-800 to-dark-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-sm text-dark-text-secondary">{stat.label}</p>
              <p className="text-2xl font-bold text-dark-text">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Info */}
      {dashboard.nextPaymentDate && (
        <Card className="bg-primary-500/10 border border-primary-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-400">Next Payment Due</p>
              <p className="text-2xl font-bold text-dark-text">{formatDate(dashboard.nextPaymentDate)}</p>
              <p className="text-sm text-dark-text-secondary">
                {dashboard.daysUntilNextPayment || 0} days remaining
              </p>
            </div>
            <svg className="w-12 h-12 text-primary-500/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DashboardOverview
