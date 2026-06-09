import '../App.css'

export default function Profile() {
  return (
    <div className="page-panel">
      <div className="page-heading">
        <h1>Profile</h1>
        <p>Account settings and learning preferences.</p>
      </div>
      <div className="meta-row">
        <span className="meta-label">Name</span>
        <span className="meta-value">Guest student</span>
      </div>
      <div className="meta-row">
        <span className="meta-label">Email</span>
        <span className="meta-value">Not signed in</span>
      </div>
      <p className="placeholder">Profile data will sync after authentication ships.</p>
    </div>
  )
}
