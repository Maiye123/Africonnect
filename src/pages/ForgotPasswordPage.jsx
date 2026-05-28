import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { sendPasswordResetEmail } from '../api/auth'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setDevResetUrl('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const result = await sendPasswordResetEmail(email.trim().toLowerCase())
      setSuccess(result.message)
      if (result.resetUrl) setDevResetUrl(result.resetUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          <h1 className="auth-title auth-title--forgot">Forgot Password</h1>
        </div>
        <p className="auth-subtitle auth-subtitle--forgot">Input your registered email</p>

        {success ? (
          <div className="auth-forgot-success">
            <p className="auth-message auth-message--success">{success}</p>
            {devResetUrl && (
              <div className="auth-dev-banner" role="alert">
                <strong>Email not configured.</strong> Use this reset link:
                <a href={devResetUrl} className="auth-reset-link">
                  {devResetUrl}
                </a>
              </div>
            )}
            <button
              type="button"
              className="auth-btn-primary auth-btn-primary--forgot"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form className="auth-form auth-form--forgot" onSubmit={handleSubmit}>
            <FormField
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="auth-message auth-message--error">{error}</p>}
            <button
              type="submit"
              className="auth-btn-primary auth-btn-primary--forgot"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
