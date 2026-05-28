import {
  Calendar,
  Download,
  Wallet,
  CircleDollarSign,
  Users,
  UserCircle,
  ClipboardList,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import '../styles/dashboard.css'

const TIME_FILTERS = ['12 months', '30 days', '7 days', '24 hours']

const STAT_CARDS = [
  { label: 'Total Transaction', icon: Wallet, color: 'blue' },
  { label: 'Successful', icon: CircleDollarSign, color: 'green' },
  { label: 'Failed', icon: Wallet, color: 'red' },
  { label: 'Agents', icon: Users, color: 'purple' },
  { label: 'Customers', icon: UserCircle, color: 'orange' },
  { label: 'Transaction Count', icon: ClipboardList, color: 'pink' },
]

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" userName="User Name" userRole="Admin">
      <div className="dashboard-toolbar">
        <div className="dashboard-filters" role="group" aria-label="Time range">
          {TIME_FILTERS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`dashboard-filter-btn${i === 0 ? ' is-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="dashboard-toolbar-right">
          <button type="button" className="dashboard-btn-outline">
            <Calendar size={18} strokeWidth={1.75} />
            Select dates
          </button>
          <button type="button" className="dashboard-btn-outline">
            <Download size={18} strokeWidth={1.75} />
            Export report
          </button>
        </div>
      </div>

      <section className="dashboard-stats" aria-label="Summary statistics">
        {STAT_CARDS.map(({ label, icon: Icon, color }) => (
          <article key={label} className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-label">{label}</span>
              <span
                className={`dashboard-stat-icon dashboard-stat-icon--${color}`}
                aria-hidden="true"
              >
                <Icon size={20} strokeWidth={1.75} />
              </span>
            </div>
            <div className="dashboard-stat-value" aria-hidden="true" />
            <div className="dashboard-stat-trend" aria-hidden="true" />
          </article>
        ))}
      </section>

      <div className="dashboard-content">
        <section className="dashboard-card dashboard-chart-card" aria-label="Transaction trend">
          <div className="dashboard-chart-header">
            <h2 className="dashboard-chart-title">Monthly Transaction Trend</h2>
            <div className="dashboard-chart-legend">
              <span className="dashboard-legend-item">
                <span className="dashboard-legend-dot dashboard-legend-dot--success" />
                Successful
              </span>
              <span className="dashboard-legend-item">
                <span className="dashboard-legend-dot dashboard-legend-dot--fail" />
                Fail
              </span>
            </div>
          </div>
          <div className="dashboard-chart-placeholder">Chart area</div>
        </section>

        <aside className="dashboard-side">
          <section className="dashboard-card dashboard-revenue-card" aria-label="Revenue">
            <h2 className="dashboard-card-title">Revenue</h2>
            <div className="dashboard-revenue-row">
              <div>
                <div className="dashboard-revenue-value" aria-hidden="true" />
                <div className="dashboard-revenue-sub" aria-hidden="true" />
              </div>
              <div className="dashboard-sparkline-placeholder" aria-hidden="true" />
            </div>
          </section>

          <section className="dashboard-card dashboard-agent-card" aria-label="Top agent">
            <h2 className="dashboard-card-title">Our Top Agent</h2>
            <div className="dashboard-agent-visual">
              <div className="dashboard-agent-star" aria-hidden="true" />
              <div className="dashboard-agent-avatar" aria-hidden="true" />
            </div>
            <div className="dashboard-agent-name" aria-hidden="true" />
            <div className="dashboard-agent-stats">
              <div className="dashboard-agent-stat">
                <Wallet size={18} strokeWidth={1.75} />
                <div className="dashboard-agent-stat-bar" aria-hidden="true" />
              </div>
              <div className="dashboard-agent-stat">
                <Users size={18} strokeWidth={1.75} />
                <div className="dashboard-agent-stat-bar" aria-hidden="true" />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}
