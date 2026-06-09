import { Link } from 'react-router-dom'
import '../App.css'

export default function Home() {
  return (
    <div className="marketing-page">
      <div className="marketing-hero">
        <p className="app-badge">NeuralAcademy 2.0</p>
        <h1>AI-powered academic success for CS students</h1>
        <p className="marketing-copy">
          Turn lecture PDFs into study guides, coding challenges, and
          personalized tutoring. Your learning operating system starts here.
        </p>
        <div className="marketing-actions">
          <Link to="/register" className="primary-button">
            Get started
          </Link>
          <Link to="/study" className="secondary-button">
            Open Study Center
          </Link>
        </div>
      </div>
    </div>
  )
}
