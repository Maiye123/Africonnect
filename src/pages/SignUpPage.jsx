import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, User, Phone, Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import PasswordField from '../components/PasswordField'
import { sendVerificationCode } from '../api/auth'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return 'Please enter your first and last name.'
    }
    if (!form.phone.trim()) return 'Please enter your phone number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Please enter a valid email address.'
    }
    if (form.password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (!/\d/.test(form.password)) {
      return 'Password must include at least one number.'
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      return 'Password must include at least one special character.'
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const result = await sendVerificationCode(form.email.trim())
      const normalizedEmail = form.email.trim().toLowerCase()
      sessionStorage.setItem('africonnect_verify_email', normalizedEmail)
      sessionStorage.setItem('africonnect_signup_draft', JSON.stringify(form))
      if (result.devCode) {
        sessionStorage.setItem('africonnect_dev_code', result.devCode)
      } else {
        sessionStorage.removeItem('africonnect_dev_code')
      }
      navigate('/verify-email', {
        state: {
          email: normalizedEmail,
          justSent: true,
          devMode: result.devMode,
          devCode: result.devCode,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout variant="signup" progressStep={1}>
      <div className="auth-back-row">
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="auth-title">Create A New Account</h1>
      </div>
      <p className="auth-subtitle auth-subtitle--signup">Input your personal details</p>

      <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
          <FormField
            label="First Name"
            name="firstName"
            icon={User}
            placeholder="Enter First Name"
            value={form.firstName}
            onChange={update('firstName')}
          />
          <FormField
            label="Last Name"
            name="lastName"
            icon={User}
            placeholder="Enter Last Name"
            value={form.lastName}
            onChange={update('lastName')}
          />
          <FormField
            label="Phone No"
            name="phone"
            type="tel"
            icon={Phone}
            placeholder="Enter Phone Number"
            value={form.phone}
            onChange={update('phone')}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="Enter Email"
            value={form.email}
            onChange={update('email')}
          />
          <PasswordField
            label="Password"
            name="password"
            icon={Lock}
            placeholder="Enter Password"
            value={form.password}
            onChange={update('password')}
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
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
          />
          {error && <p className="auth-message auth-message--error">{error}</p>}
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Sending code…' : 'Continue'}
          </button>
        </form>

      <p className="auth-footer-text">
        Do you have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  )
}
