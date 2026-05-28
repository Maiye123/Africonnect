import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  UserCircle,
  Monitor,
  AlertCircle,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight },
  { label: 'Agents', icon: Users },
  { label: 'Customers', icon: UserCircle },
  { label: 'Terminals', icon: Monitor },
  { label: 'Dispute', icon: AlertCircle },
  { label: 'Settings', icon: Settings, path: '/settings' },
]
