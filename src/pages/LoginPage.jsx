import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import PasswordField from '../components/PasswordField'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1 className="auth-title">Login To Your Account</h1>
        <p className="auth-subtitle">Welcome back! Input your login details</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            label="Password"
            name="password"
            icon={Lock}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot Password ?</Link>
          </div>
          <button type="submit" className="auth-btn-primary">
            Login
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
