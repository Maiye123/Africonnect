import { useState } from 'react'
import { Pencil, Image } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import '../styles/settings.css'

const TABS = ['Personal Info', 'Business Info', 'Notification', 'KYC', 'Security']

const PERSONAL_INFO = {
  firstName: 'Quin',
  lastName: 'Darlington',
  email: 'meetdarlingtono@gmail.com',
  phone: '09155334727',
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="settings-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`settings-toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="settings-toggle-knob" />
      </button>
      <span className="settings-toggle-label">{label}</span>
    </div>
  )
}

function PersonalInfoSection() {
  return (
    <>
      <div className="settings-card-header">
        <div className="settings-card-header-text">
          <h2 className="settings-section-title">Personal Information</h2>
          <p className="settings-section-desc settings-section-desc--flush">
            This information will be displayed so be careful what you share
          </p>
        </div>
        <button type="button" className="settings-edit-btn">
          <Pencil size={16} strokeWidth={2} />
          Edit
        </button>
      </div>

      <div className="settings-profile-wrap">
        <div className="settings-profile-circle" aria-label="Profile photo placeholder">
          <Image size={32} strokeWidth={1.5} />
        </div>
      </div>

      <div className="settings-fields-box">
        <div className="settings-fields-grid">
          <div className="settings-field">
            <span className="settings-field-label">First Name</span>
            <span className="settings-field-value">{PERSONAL_INFO.firstName}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Last Name</span>
            <span className="settings-field-value">{PERSONAL_INFO.lastName}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Email</span>
            <span className="settings-field-value">{PERSONAL_INFO.email}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Phone No</span>
            <span className="settings-field-value">{PERSONAL_INFO.phone}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function NotificationSection() {
  const [emailOn, setEmailOn] = useState(true)
  const [pushOn, setPushOn] = useState(true)

  return (
    <>
      <h2 className="settings-section-title">Notification</h2>
      <p className="settings-section-desc">
        Get notified for every time you login to your account
      </p>
      <div className="settings-toggles-box">
        <Toggle checked={emailOn} onChange={setEmailOn} label="Email" />
        <Toggle checked={pushOn} onChange={setPushOn} label="Push Notification" />
      </div>
    </>
  )
}

function KycSection() {
  return (
    <div className="settings-kyc">
      <div className="settings-kyc-hanger">
        <div className="settings-kyc-lines" aria-hidden="true">
          <span className="settings-kyc-line settings-kyc-line--left" />
          <span className="settings-kyc-line settings-kyc-line--right" />
        </div>
        <div className="settings-kyc-sign">
          <p className="settings-kyc-under">UNDER CONSTRUCTION</p>
          <p className="settings-kyc-soon">COMING SOON</p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Personal Info')

  return (
    <DashboardLayout
      title="Settings"
      showNotifications={false}
      userName="Quin Darlington"
      userRole="Admin"
    >
      <div className="settings-tabs-wrap">
        <div className="settings-tabs" role="tablist" aria-label="Settings sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`settings-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={`settings-card${activeTab === 'KYC' ? ' settings-card--kyc' : ''}`}>
        {activeTab === 'Personal Info' && <PersonalInfoSection />}
        {activeTab === 'Notification' && <NotificationSection />}
        {activeTab === 'KYC' && <KycSection />}
        {activeTab !== 'Personal Info' &&
          activeTab !== 'Notification' &&
          activeTab !== 'KYC' && (
            <p className="settings-placeholder">{activeTab} settings coming soon.</p>
          )}
      </div>
    </DashboardLayout>
  )
}
