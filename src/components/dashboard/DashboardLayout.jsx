import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import '../../styles/dashboard.css'

export default function DashboardLayout({
  title,
  children,
  showNotifications = true,
  userName = 'Quin Darlington',
  userRole = 'Admin',
}) {
  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <NavLink to="/dashboard" className="dashboard-logo">
          <span className="dashboard-logo-icon" aria-hidden="true">
            A
          </span>
          Africonnect
        </NavLink>

        <nav className="dashboard-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) =>
            path ? (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `dashboard-nav-link${isActive ? ' is-active' : ''}`
                }
                end={path === '/dashboard'}
              >
                <Icon strokeWidth={1.75} />
                {label}
              </NavLink>
            ) : (
              <a
                key={label}
                href="#"
                className="dashboard-nav-link"
                onClick={(e) => e.preventDefault()}
              >
                <Icon strokeWidth={1.75} />
                {label}
              </a>
            ),
          )}
        </nav>

        <div className="dashboard-promo">
          <p className="dashboard-promo-text">
            Last chance — 30% Off
            <br />
            Don&apos;t miss out!
          </p>
          <span className="dashboard-promo-timer" aria-hidden="true">
            — : — : — : —
          </span>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">{title}</h1>
          <div className="dashboard-header-actions">
            {showNotifications && (
              <button type="button" className="dashboard-notify" aria-label="Notifications">
                <Bell size={20} strokeWidth={1.75} />
                <span className="dashboard-notify-badge" aria-hidden="true" />
              </button>
            )}
            <div className="dashboard-user">
              <div className="dashboard-user-avatar" aria-hidden="true" />
              <div>
                <div className="dashboard-user-name">{userName}</div>
                <div className="dashboard-user-role">{userRole}</div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
