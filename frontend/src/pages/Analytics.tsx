import '../App.css'

export default function Analytics() {
  return (
    <div className="page-panel">
      <div className="page-heading">
        <h1>Analytics</h1>
        <p>Study time, quiz scores, and weak-topic insights will live here.</p>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-label">Study hours (week)</div>
          <div className="stat-value">—</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Quiz average</div>
          <div className="stat-value">—</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Challenge success rate</div>
          <div className="stat-value">—</div>
        </article>
      </div>
    </div>
  )
}
