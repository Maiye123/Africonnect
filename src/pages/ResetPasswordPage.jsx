import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import { resetPassword } from '../api/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword({ token, password, confirmPassword })
      setSuccess(result.message)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-card auth-card--forgot">
          <p className="auth-message auth-message--error">
            This reset link is invalid. Please request a new one from the forgot password page.
          </p>
          <Link to="/forgot-password" className="auth-btn-primary auth-btn-primary--forgot">
            Forgot Password
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--forgot">
        <div className="auth-back-row">
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => navigate('/login')}
            aria-label="Go back to login"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <h1 className="auth-title auth-title--forgot">Reset Password</h1>
        </div>
        <p className="auth-subtitle auth-subtitle--forgot">Enter your new password below</p>

        <form className="auth-form auth-form--forgot" onSubmit={handleSubmit}>
          <PasswordField
            label="New Password"
            name="password"
            icon={Lock}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-hints">
            <span className="auth-hint">Min 8 characters</span>
            <span className="auth-hint">1 Number</span>
            <span className="auth-hint">Special Character</span>
          </div>
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            icon={Lock}
            placeholder="Enter Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="auth-message auth-message--error">{error}</p>}
          {success && <p className="auth-message auth-message--success">{success}</p>}
          <button
            type="submit"
            className="auth-btn-primary auth-btn-primary--forgot"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
