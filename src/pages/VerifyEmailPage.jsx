import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import OtpInput from '../components/OtpInput'
import { sendVerificationCode, verifyEmailCode } from '../api/auth'

const TIMER_SECONDS = 60

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS)
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devCode, setDevCode] = useState('')
  const [devMode, setDevMode] = useState(false)

  async function fetchCode(targetEmail, showNotification = true) {
    setCodeLoading(true)
    setError('')
    try {
      const result = await sendVerificationCode(targetEmail)
      if (result.devCode) {
        setDevCode(result.devCode)
        setDevMode(true)
        sessionStorage.setItem('africonnect_dev_code', result.devCode)
      } else {
        setDevMode(false)
        sessionStorage.removeItem('africonnect_dev_code')
      }
      if (showNotification) {
        setShowToast(true)
        setTimeout(() => setShowToast(false), 8000)
      }
      setSecondsLeft(TIMER_SECONDS)
      return result
    } catch (err) {
      setError(err.message)
      setDevMode(true)
      return null
    } finally {
      setCodeLoading(false)
    }
  }

  useEffect(() => {
    const fromState = location.state?.email
    const fromStorage = sessionStorage.getItem('africonnect_verify_email')
    const resolved = (fromState || fromStorage || '').trim().toLowerCase()

    if (!resolved) {
      navigate('/signup', { replace: true })
      return
    }

    setEmail(resolved)
    sessionStorage.setItem('africonnect_verify_email', resolved)

    const cached = sessionStorage.getItem('africonnect_dev_code')
    if (cached) {
      setDevCode(cached)
      setDevMode(true)
    }

    fetchCode(resolved, Boolean(location.state?.justSent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  async function handleResend() {
    if (resending || !email) return
    setResending(true)
    await fetchCode(email, true)
    setResending(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (code.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }

    setLoading(true)
    try {
      await verifyEmailCode(email, code)
      setSuccess('Email verified! You can now log in.')
      sessionStorage.removeItem('africonnect_verify_email')
      sessionStorage.removeItem('africonnect_dev_code')
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!email) return null

  return (
    <AuthLayout variant="verify" progressStep={2}>
      {showToast && (
        <div className="auth-toast" role="status">
          <CheckCircle2 size={18} />
          <span>
            {devMode
              ? 'Code ready — enter it below'
              : 'Verification code sent — check your inbox'}
          </span>
        </div>
      )}

      <div className="auth-verify-card">
        <div className="auth-back-row">
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => navigate('/signup')}
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="auth-title">Verify Your Email</h1>
        </div>
        <p className="auth-subtitle auth-subtitle--verify">
          Input the code that was sent to your mail inbox
        </p>
        <p className="auth-verify-email">{email}</p>

        {codeLoading && (
          <div className="auth-dev-banner auth-dev-banner--loading" role="status">
            Generating your verification code…
          </div>
        )}

        {!codeLoading && devCode && (
          <div className="auth-dev-banner" role="alert">
            <strong>Your verification code:</strong>
            <span className="auth-dev-code">{devCode}</span>
            <p className="auth-dev-hint">
              Email is not configured yet, so the code appears here instead of your inbox.
              To send real emails, add SMTP settings in a <code>.env</code> file and restart{' '}
              <code>npm run dev</code>.
            </p>
          </div>
        )}

        {!codeLoading && error && !devCode && (
          <div className="auth-dev-banner auth-dev-banner--error" role="alert">
            <AlertCircle size={18} />
            <div>
              <strong>Could not get a code</strong>
              <p>{error}</p>
              <p className="auth-dev-hint">
                Make sure you run <code>npm run dev</code> (not just the website). The terminal
                should show: <code>Africonnect API running on http://localhost:3001</code>
              </p>
              <button type="button" className="auth-retry-btn" onClick={() => fetchCode(email, true)}>
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="auth-verify-icon" aria-hidden="true">
          <Mail size={28} strokeWidth={1.75} />
        </div>

        <form className="auth-verify-form" onSubmit={handleSubmit}>
          <OtpInput value={code} onChange={setCode} />

          {error && devCode && <p className="auth-message auth-message--error">{error}</p>}
          {success && <p className="auth-message auth-message--success">{success}</p>}

          <button type="submit" className="auth-btn-primary" disabled={loading || codeLoading}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>

          <p className="auth-timer">
            {minutes} : {seconds}
          </p>

          <p className="auth-resend">
            Didn&apos;t get a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || codeLoading || secondsLeft > 0}
            >
              {resending ? 'Sending…' : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
            </button>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
