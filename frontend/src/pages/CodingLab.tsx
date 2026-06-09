import '../App.css'

export default function CodingLab() {
  return (
    <div className="page-panel">
      <div className="page-heading">
        <h1>Coding Lab</h1>
        <p>Generate Python challenges from your notes and run them in a sandbox.</p>
      </div>
      <ul className="right-pane-list">
        <li>Monaco editor integration (planned)</li>
        <li>Challenge generator wired to `/generate-coding-challenge`</li>
        <li>Ask Sage hints via `/analyze-code`</li>
      </ul>
      <p className="placeholder">Use Study Center today; Coding Lab UI ships next.</p>
    </div>
  )
}
