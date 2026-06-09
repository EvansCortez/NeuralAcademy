import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="platform-shell">
      <Sidebar />
      <div className="platform-main">
        <Navbar />
        <div className="platform-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
