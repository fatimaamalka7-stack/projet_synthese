import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiMessageSquare, FiSettings, FiLogOut,
  FiMenu, FiX, FiSun, FiMoon, FiBell
} from 'react-icons/fi'
import api from '../../services/api'

const navItems = [
  { to: '/admin', icon: FiGrid, labelKey: 'admin.dashboard', end: true },
  { to: '/admin/produits', icon: FiPackage, labelKey: 'admin.products' },
  { to: '/admin/commandes', icon: FiShoppingBag, labelKey: 'admin.orders', badge: 'orders' },
  { to: '/admin/utilisateurs', icon: FiUsers, labelKey: 'admin.users' },
  { to: '/admin/avis', icon: FiMessageSquare, labelKey: 'admin.reviews' },
  { to: '/admin/parametres', icon: FiSettings, labelKey: 'admin.settings' },
]

export default function AdminLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unseenOrders, setUnseenOrders] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const loadUnseenOrders = () => {
      api.get('/admin/orders/unseen-count')
        .then(r => setUnseenOrders(r.data.count || 0))
        .catch(() => setUnseenOrders(0))
    }

    const loadNotifications = () => {
      Promise.all([
        api.get('/admin/notifications', { params: { per_page: 8 } }),
        api.get('/admin/notifications/unread-count'),
      ]).then(([list, count]) => {
        setNotifications(list.data.data || [])
        setUnreadNotifications(count.data.count || 0)
      }).catch(() => {
          const [unreadCount, setUnreadCount] = useState(0)
          const [notifications, setNotifications] = useState([])
          const [showNotifications, setShowNotifications] = useState(false)
        setUnreadNotifications(0)
      })
    }

    const refreshAdminBadges = () => {
      loadUnseenOrders()
      loadNotifications()
    }

    loadUnseenOrders()
    loadNotifications()
    const interval = window.setInterval(refreshAdminBadges, 5000)
    window.addEventListener('orders:seen', refreshAdminBadges)
    window.addEventListener('notifications:changed', refreshAdminBadges)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('orders:seen', refreshAdminBadges)
      window.removeEventListener('notifications:changed', refreshAdminBadges)
    }
  }, [])

  const markNotificationRead = async (notification) => {
    if (!notification.read_at) {
      await api.put(`/admin/notifications/${notification.id}/read`)
      window.dispatchEvent(new Event('notifications:changed'))
    }

    if (notification.type === 'order_created') {
      navigate('/admin/commandes')
    } else if (notification.type === 'review_created') {
      navigate('/admin/avis')
    } else if (notification.type === 'user_registered' || notification.type === 'admin_created') {
      navigate('/admin/utilisateurs')
    } else if (notification.type === 'product_created') {
      navigate('/admin/produits')
    }

    setNotificationsOpen(false)
  }

  const markAllNotificationsRead = async () => {
    await api.put('/admin/notifications/read-all')
    window.dispatchEvent(new Event('notifications:changed'))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800">
          <span className="font-display text-xl font-bold text-primary-700 dark:text-primary-400">
            Vête<span className="text-accent-500">Mode</span>
            <span className="text-xs text-gray-400 font-body font-normal ml-1">Admin</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, labelKey, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span className="flex-1">{t(labelKey)}</span>
              {badge === 'orders' && unseenOrders > 0 && (
                <span className="min-w-[20px] h-5 text-[11px] leading-5 rounded-full bg-red-500 text-white flex items-center justify-center px-1.5">
                  {unseenOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
            <FiLogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <FiMenu size={20} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-gray-500">{t('admin.dashboard_overview')}</h1>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(open => !open)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
                <FiBell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 text-[11px] leading-5 rounded-full bg-red-500 text-white flex items-center justify-center px-1.5">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Notifications</p>
                      <p className="text-xs text-gray-500">{unreadNotifications} non lues</p>
                    </div>
                    {unreadNotifications > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        Tout lire
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">Aucune notification</div>
                    ) : notifications.map(notification => (
                      <button key={notification.id} onClick={() => markNotificationRead(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors ${!notification.read_at ? 'bg-red-50/60 dark:bg-red-950/20' : ''}`}>
                        <div className="flex items-start gap-3">
                          {!notification.read_at && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{notification.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notification.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {dark ? <FiSun size={18} className="text-yellow-400" /> : <FiMoon size={18} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
