import { useState } from 'react'
import { LoanCard } from './LoanCard'

/**
 * LoanList Component - Displays grid of loans with filtering
 */
export const LoanList = ({ loans = [] }) => {
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === 'ALL') return true
    return loan.loanStatus === filterStatus
  })

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'ACTIVE', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-text-secondary hover:bg-dark-600'
            }`}
          >
            {status === 'ALL' ? 'All Loans' : `${status} Loans`}
            {status !== 'ALL' && (
              <span className="ml-2 opacity-75">
                ({loans.filter((l) => l.loanStatus === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loans Grid */}
      {filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => (
            <LoanCard key={loan.loanId} loan={loan} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-dark-text-secondary">No {filterStatus !== 'ALL' && filterStatus.toLowerCase()} loans found</p>
        </div>
      )}
    </div>
  )
}

export default LoanList
