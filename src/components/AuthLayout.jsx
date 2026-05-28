import '../styles/auth.css'

function AuthProgress({ step }) {
  return (
    <div className={`auth-progress-track auth-progress-track--step${step}`} aria-hidden="true">
      <div className="auth-progress-fill" />
      <span className="auth-progress-dot is-done" />
      <span className={`auth-progress-dot ${step >= 2 ? 'is-done' : ''}`} data-pos="mid" />
      <span className="auth-progress-dot" data-pos="end" />
    </div>
  )
}

export default function AuthLayout({
  children,
  showProgress = false,
  variant = 'default',
  progressStep = 1,
  formClassName = '',
}) {
  const isSignup = variant === 'signup' || showProgress
  const isVerify = variant === 'verify'

  return (
    <div className="auth-page">
      <div
        className={`auth-shell${isSignup ? ' auth-shell--signup' : ''}${isVerify ? ' auth-shell--verify' : ''}`}
      >
        <aside className="auth-hero" aria-hidden="false">
          <div className="auth-logo">
            <span className="auth-logo-icon" aria-hidden="true">
              A
            </span>
            Africonnect
          </div>
          <div className="auth-hero-caption">
            <h2>Run Your Business Smarter with Africonnect</h2>
            <p>
              Get full control over your operations — from managing agents and tracking
              transactions to monitoring performance in real time.
            </p>
          </div>
        </aside>

        <main
          className={`auth-form-panel${isSignup ? ' auth-form-panel--signup' : ''}${isVerify ? ' auth-form-panel--verify' : ''} ${formClassName}`}
        >
          {isSignup && (
            <div className="auth-signup-wrap">
              <AuthProgress step={progressStep} />
              <div className="auth-signup-card">{children}</div>
            </div>
          )}
          {isVerify && (
            <div className="auth-verify-wrap">
              <AuthProgress step={progressStep} />
              {children}
            </div>
          )}
          {!isSignup && !isVerify && children}
        </main>
      </div>
    </div>
  )
}
