import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Alert, Modal } from '../components/Common'

/**
 * GetStarted Page - Landing page with Login/Register Modal
 */
function GetStarted() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Form errors
  const [loginErrors, setLoginErrors] = useState({})
  const [registerErrors, setRegisterErrors] = useState({})

  const validateLoginForm = () => {
    const errors = {}
    if (!loginForm.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      errors.email = 'Invalid email format'
    }
    if (!loginForm.password) {
      errors.password = 'Password is required'
    }
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegisterForm = () => {
    const errors = {}
    if (!registerForm.username) {
      errors.username = 'Username is required'
    }
    if (!registerForm.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Invalid email format'
    }
    if (!registerForm.password) {
      errors.password = 'Password is required'
    } else if (registerForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setRegisterErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!validateLoginForm()) return

    setIsLoading(true)
    try {
      const result = await login(loginForm.email, loginForm.password)
      if (result.success) {
        setAlert({ type: 'success', message: 'Login successful!' })
        setTimeout(() => navigate('/home'), 1000)
      } else {
        setAlert({ type: 'error', message: result.error || 'Login failed' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!validateRegisterForm()) return

    setIsLoading(true)
    try {
      const result = await register(registerForm.username, registerForm.email, registerForm.password)
      if (result.success) {
        setAlert({ type: 'success', message: 'Registration successful!' })
        setTimeout(() => navigate('/home'), 1000)
      } else {
        setAlert({ type: 'error', message: result.error || 'Registration failed' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setLoginForm({ email: '', password: '' })
    setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' })
    setLoginErrors({})
    setRegisterErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs for visual interest */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoDismiss={alert.type === 'success'}
          />
        )}

        {/* Main Content Card */}
        <div className="bg-dark-800 rounded-xl shadow-lg shadow-black/50 p-12 space-y-8 border border-dark-700 text-center">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">EMI</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-dark-text mb-2">EMI Insight</h1>
              <p className="text-lg text-dark-text-secondary">Smart Loan Management Made Simple</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 max-w-xl mx-auto">
            <p className="text-dark-text leading-relaxed text-base">
              EMI Insight helps you manage your loans efficiently with real-time tracking, amortization schedules, and prepayment simulations. Stay in control of your finances and make informed decisions about your debts.
            </p>
            <p className="text-dark-text leading-relaxed text-base">
              Track multiple loans, visualize your progress, and achieve your financial goals with our comprehensive loan management platform. Experience the peace of mind that comes with complete visibility over your loan portfolio.
            </p>
          </div>

          {/* Features Grid (Optional) */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <p className="text-sm text-dark-text-secondary">Track Progress</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📈</div>
              <p className="text-sm text-dark-text-secondary">Smart Analytics</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⚡</div>
              <p className="text-sm text-dark-text-secondary">Fast Payments</p>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-6">
            <Button
              onClick={() => setShowModal(true)}
              fullWidth
              size="md"
              className="text-lg py-3"
            >
              Get Started
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-dark-text-secondary pt-4 border-t border-dark-700">
            <p>© 2026 EMI Insight. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Login/Register Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} size="md">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-dark-700">
            <button
              onClick={() => {
                setActiveTab('login')
                setLoginErrors({})
              }}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'login'
                  ? 'text-primary-500 border-primary-500'
                  : 'text-dark-text-secondary border-transparent hover:text-dark-text'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setRegisterErrors({})
              }}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'register'
                  ? 'text-primary-500 border-primary-500'
                  : 'text-dark-text-secondary border-transparent hover:text-dark-text'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                error={loginErrors.email}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                error={loginErrors.password}
                required
              />
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="John Doe"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                error={registerErrors.username}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                error={registerErrors.email}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                error={registerErrors.password}
                helperText="At least 6 characters"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                error={registerErrors.confirmPassword}
                required
              />
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Tab Footer */}
          <div className="text-center text-sm text-dark-text-secondary">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-primary-500 font-semibold hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-primary-500 font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GetStarted
