import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/study', label: 'Study Center' },
  { to: '/coding', label: 'Coding Lab' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  return (
    <aside className="platform-sidebar">
      <div className="platform-brand">
        NeuralAcademy
        <span>Academic OS · v2.0</span>
      </div>

      <nav className="platform-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="platform-sidebar-footer">
        Sprint 1: layout + auth foundation
      </div>
    </aside>
  )
}
