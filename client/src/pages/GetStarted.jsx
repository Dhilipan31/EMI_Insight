import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Alert } from '../components/Common'

/**
 * GetStarted Page - Landing page with Login/Register
 */
function GetStarted() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoDismiss={alert.type === 'success'}
          />
        )}

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EMI</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">EMI Insight</h1>
            <p className="text-gray-500">Manage your loans efficiently</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login')
                setLoginErrors({})
                setAlert(null)
              }}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'login'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setRegisterErrors({})
                setAlert(null)
              }}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'register'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
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

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2026 EMI Insight. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default GetStarted
