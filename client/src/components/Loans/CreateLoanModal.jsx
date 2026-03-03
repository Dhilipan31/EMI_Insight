import { useState } from 'react'
import { Modal, Button, Input, DatePicker, Alert } from '../Common'
import { useLoan } from '../../hooks/useLoan'

/**
 * CreateLoanModal Component - Form to create new loan
 */
export const CreateLoanModal = ({ isOpen, onClose, onLoanCreated }) => {
  const { createLoan, isLoading, error } = useLoan()
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    interestRate: '',
    tenureMonths: '',
    startDate: '',
    emiPayDay: '',
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Loan name is required'
    }
    if (!formData.principal || Number(formData.principal) <= 0) {
      newErrors.principal = 'Principal amount must be greater than 0'
    }
    if (!formData.interestRate || Number(formData.interestRate) < 0) {
      newErrors.interestRate = 'Interest rate must be valid'
    }
    if (!formData.tenureMonths || Number(formData.tenureMonths) <= 0) {
      newErrors.tenureMonths = 'Tenure must be greater than 0'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.emiPayDay || Number(formData.emiPayDay) < 1 || Number(formData.emiPayDay) > 28) {
      newErrors.emiPayDay = 'EMI Pay Day must be between 1 and 28'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createLoan({
        name: formData.name,
        principal: Number(formData.principal),
        interestRate: Number(formData.interestRate),
        tenureMonths: Number(formData.tenureMonths),
        startDate: formData.startDate,
        emiPayDay: Number(formData.emiPayDay),
      })

      setAlert({ type: 'success', message: 'Loan created successfully!' })
      setTimeout(() => {
        setFormData({ name: '', principal: '', interestRate: '', tenureMonths: '', startDate: '', emiPayDay: '' })
        onLoanCreated()
        onClose()
      }, 1000)
    } catch (err) {
      setAlert({ type: 'error', message: error || 'Failed to create loan' })
    }
  }

  const handleClose = () => {
    setFormData({ name: '', principal: '', interestRate: '', tenureMonths: '', startDate: '', emiPayDay: '' })
    setErrors({})
    setAlert(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Loan"
      size="lg"
      footer={
        <>
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Loan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoDismiss={alert.type === 'success'}
          />
        )}

        <Input
          label="Loan Name"
          placeholder="e.g., Home Loan, Car Loan"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Principal Amount (₹)"
          type="number"
          placeholder="e.g., 2000000"
          value={formData.principal}
          onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
          error={errors.principal}
          required
        />

        <Input
          label="Annual Interest Rate (%)"
          type="number"
          placeholder="e.g., 7.5"
          value={formData.interestRate}
          onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
          error={errors.interestRate}
          required
          step="0.01"
        />

        <Input
          label="Tenure (Months)"
          type="number"
          placeholder="e.g., 240"
          value={formData.tenureMonths}
          onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
          error={errors.tenureMonths}
          required
        />

        <DatePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
          required
        />

        <Input
          label="EMI Payment Day (1-28)"
          type="number"
          placeholder="e.g., 15"
          value={formData.emiPayDay}
          onChange={(e) => setFormData({ ...formData, emiPayDay: e.target.value })}
          error={errors.emiPayDay}
          required
          min="1"
          max="28"
          helperText="Day of month for EMI payment. Use 1-28 to handle all months uniformly."
        />
      </div>
    </Modal>
  )
}

export default CreateLoanModal
