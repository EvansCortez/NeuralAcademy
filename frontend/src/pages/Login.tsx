import { Link } from 'react-router-dom'
import '../App.css'

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="form-hint">JWT authentication coming in Sprint 1 Week 1.</p>
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <label className="form-field">
            <span className="form-label">Email</span>
            <input type="email" placeholder="you@school.edu" />
          </label>
          <label className="form-field">
            <span className="form-label">Password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="submit" className="primary-button" disabled>
            Log in (soon)
          </button>
        </form>
        <p className="auth-switch">
          No account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
