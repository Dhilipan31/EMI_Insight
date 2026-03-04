import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { TopBar, Sidebar, Card, Button, Input, Alert } from '../components/Common'
import { formatCurrency } from '../utils/formatters'

/**
 * ProfilePage - User profile management
 */
function ProfilePage() {
  const { user, updateProfile, getProfile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    salary: user?.salary || '',
    monthlyExpense: user?.monthlyExpense || '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        salary: user.salary || '',
        monthlyExpense: user.monthlyExpense || '',
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (formData.salary !== '' && Number(formData.salary) < 0) {
      newErrors.salary = 'Salary cannot be negative'
    }
    if (formData.monthlyExpense !== '' && Number(formData.monthlyExpense) < 0) {
      newErrors.monthlyExpense = 'Monthly expense cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await updateProfile({
        username: formData.username,
        salary: formData.salary ? Number(formData.salary) : null,
        monthlyExpense: formData.monthlyExpense ? Number(formData.monthlyExpense) : null,
      })

      if (result.success) {
        setAlert({ type: 'success', message: 'Profile updated successfully!' })
        setTimeout(() => {
          setIsEditing(false)
          getProfile()
        }, 1000)
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const disposableIncome = formData.salary && formData.monthlyExpense
    ? (Number(formData.salary)/12)- Number(formData.monthlyExpense)
    : null

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-2xl space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-dark-text">My Profile</h1>
              <p className="text-dark-text-secondary">Manage your account information and preferences</p>
            </div>

            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                autoDismiss={alert.type === 'success'}
              />
            )}

            {/* Profile Header Card */}
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                    {user?.username
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark-text">{user?.username}</h2>
                    <p className="text-dark-text-secondary">{user?.email}</p>
                    <p className="text-sm text-dark-text-secondary">User ID: {user?.userId}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (isEditing) {
                      setFormData({
                        username: user?.username || '',
                        salary: user?.salary || '',
                        monthlyExpense: user?.monthlyExpense || '',
                      })
                    }
                    setIsEditing(!isEditing)
                  }}
                  variant={isEditing ? 'secondary' : 'primary'}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </Card>

            {/* Basic Information */}
            <Card title="Basic Information">
              <div className="space-y-4">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={errors.username}
                  disabled={!isEditing}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">Email</label>
                  <div className="px-4 py-2.5 border border-dark-700 rounded-lg bg-dark-800 text-dark-text">
                    {user?.email}
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Information */}
            <Card title="Financial Information">
              <div className="space-y-4">
                <Input
                  label="Annual Salary (₹)"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  error={errors.salary}
                  disabled={!isEditing}
                  placeholder="Enter your annual salary"
                  helperText={formData.salary ? `Monthly: ${formatCurrency(Number(formData.salary) / 12)}` : ''}
                />
                <Input
                  label="Monthly Expenses (₹)"
                  type="number"
                  value={formData.monthlyExpense}
                  onChange={(e) => setFormData({ ...formData, monthlyExpense: e.target.value })}
                  error={errors.monthlyExpense}
                  disabled={!isEditing}
                  placeholder="Enter your monthly expenses"
                />

                {/* Calculated Values */}
                {formData.salary && (
                  <div className="bg-dark-700/50 rounded-lg p-4 space-y-3 border border-primary-500/30">
                    <h4 className="font-semibold text-dark-text">Financial Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-dark-text-secondary">Monthly Salary</p>
                        <p className="text-lg font-bold text-dark-text">
                          {formatCurrency(Number(formData.salary) / 12)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-text-secondary">Monthly Expenses</p>
                        <p className="text-lg font-bold text-dark-text">
                          {formData.monthlyExpense ? formatCurrency(formData.monthlyExpense) : '₹0.00'}
                        </p>
                      </div>
                      {disposableIncome !== null && (
                        <div className="col-span-2">
                          <p className="text-xs text-dark-text-secondary">Available for EMI & Savings</p>
                          <p className={`text-lg font-bold ${disposableIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(disposableIncome)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex gap-2 pt-4 border-t border-dark-700 mt-4">
                  <Button
                    onClick={handleSave}
                    isLoading={isLoading}
                    fullWidth
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>

            {/* Security Section */}
            <Card title="Security">
              <div className="space-y-4">
                <div className="bg-dark-800 rounded-lg p-4">
                  <h4 className="font-semibold text-dark-text mb-2">Password</h4>
                  <p className="text-sm text-dark-text-secondary mb-3">Last changed: Never</p>
                  <Button variant="outline" disabled>
                    Change Password (Coming Soon)
                  </Button>
                </div>
                <div className="bg-dark-800 rounded-lg p-4">
                  <h4 className="font-semibold text-dark-text mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-dark-text-secondary mb-3">Status: Not enabled</p>
                  <Button variant="outline" disabled>
                    Enable 2FA (Coming Soon)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card title="Danger Zone" className="border-red-500/30">
              <div className="space-y-4">
                <p className="text-sm text-dark-text-secondary">
                  Irreversible actions that will permanently affect your account.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled>
                    Download My Data
                  </Button>
                  <Button variant="danger" disabled>
                    Delete Account (Coming Soon)
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
