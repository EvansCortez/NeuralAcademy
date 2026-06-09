import '../App.css'

export default function Dashboard() {
  return (
    <div className="page-panel">
      <div className="page-heading">
        <h1>Welcome back</h1>
        <p>Your learning dashboard will track documents, study guides, and streaks.</p>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-label">Uploaded documents</div>
          <div className="stat-value">—</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Study guides generated</div>
          <div className="stat-value">—</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Coding challenges completed</div>
          <div className="stat-value">—</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Learning streak</div>
          <div className="stat-value">— days</div>
        </article>
      </div>
      <p className="placeholder">
        Auth and PostgreSQL arrive in Sprint 1. Metrics will populate once accounts are live.
      </p>
    </div>
  )
}
