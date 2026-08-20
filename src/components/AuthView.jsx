import { useState } from 'react'
import mapBg from '../assets/mapp.jpg'

export default function AuthView({ onSignIn, onSignUp, loading }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isLoginMode && !fullName.trim()) {
      setError('Captain name is required.')
      return
    }
    const result = isLoginMode
      ? await onSignIn(email, password, fullName.trim() || null)
      : await onSignUp(email, password, fullName.trim())
    if (result.error) {
      setError(result.error.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <span className="auth-badge">EFB Access</span>
            <h2 className="auth-title">
              {isLoginMode ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="auth-subtitle">
              {isLoginMode
                ? 'Please enter your credentials to access the planner.'
                : 'Join the dispatch center to save your rotations.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLoginMode && (
              <div className="form-group">
                <label className="form-label">Captain Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maverick"
                  className="form-input"
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="captain@virtual.com"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? 'Authenticating...' : isLoginMode ? 'Sign In to Dashboard' : 'Create Dispatch Account'}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isLoginMode ? "Don't have access yet? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="auth-toggle-btn"
              >
                {isLoginMode ? 'Request Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="auth-hero" style={{ backgroundImage: `url(${mapBg})` }}>
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">
            Operations<br />Control Center.
          </h1>
          <p className="auth-hero-desc">
            Manage your fleet rotations, calculate precise block times, and streamline your
            virtual airline operations from a centralized dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
