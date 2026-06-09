import { Link } from 'react-router-dom'

type NavbarProps = {
  title?: string
}

export default function Navbar({ title = 'Student workspace' }: NavbarProps) {
  return (
    <header className="platform-topbar">
      <div className="platform-topbar-title">{title}</div>
      <div className="platform-auth-links">
        <Link to="/login">Log in</Link>
        <Link to="/register" className="primary-link">
          Sign up
        </Link>
      </div>
    </header>
  )
}
