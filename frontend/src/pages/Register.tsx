import { Link } from 'react-router-dom'
import '../App.css'

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="form-hint">Registration will create a user record in PostgreSQL.</p>
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input type="text" placeholder="evans" />
          </label>
          <label className="form-field">
            <span className="form-label">Email</span>
            <input type="email" placeholder="you@school.edu" />
          </label>
          <label className="form-field">
            <span className="form-label">Password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="submit" className="primary-button" disabled>
            Sign up (soon)
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
