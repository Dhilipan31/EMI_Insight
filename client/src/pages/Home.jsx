import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLoan } from '../hooks/useLoan'
import { TopBar, Sidebar, Card, Button, Loading } from '../components/Common'
import { DashboardOverview } from '../components/Dashboard/DashboardOverview'
import { LoanList } from '../components/Loans/LoanList'
import { CreateLoanModal } from '../components/Loans/CreateLoanModal'

/**
 * Home Page - Main dashboard for loan management
 */
function Home() {
  const { user, getProfile } = useAuth()
  const { loans, isLoading, getAllLoans } = useLoan()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreateLoan, setShowCreateLoan] = useState(false)

  useEffect(() => {
    // Fetch user profile and loans on mount
    const fetchData = async () => {
      await getProfile()
      await getAllLoans()
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Welcome Message */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600">Here's your loan overview at a glance</p>
            </div>

            {/* Dashboard Overview */}
            <DashboardOverview />

            {/* Loans Section */}
            {isLoading ? (
              <Loading message="Loading your loans..." />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Loans</h2>
                  <Button
                    onClick={() => setShowCreateLoan(true)}
                    size="md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Loan
                  </Button>
                </div>

                {loans.length > 0 ? (
                  <LoanList loans={loans} />
                ) : (
                  <Card className="text-center py-12">
                    <div className="space-y-4">
                      <p className="text-gray-500">No loans yet</p>
                      <Button
                        onClick={() => setShowCreateLoan(true)}
                        size="md"
                      >
                        Create Your First Loan
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Loan Modal */}
      <CreateLoanModal
        isOpen={showCreateLoan}
        onClose={() => setShowCreateLoan(false)}
        onLoanCreated={() => {
          setShowCreateLoan(false)
          getAllLoans()
        }}
      />
    </div>
  )
}

export default Home
