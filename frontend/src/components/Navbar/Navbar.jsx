import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiMoon, FiSun, FiPackage, FiSettings } from 'react-icons/fi'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggle } = useTheme()
  const { language, setLanguage, languages } = useLanguage()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserMenu(false)
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/vetements', label: t('nav.clothes') },
    { to: '/chaussures', label: t('nav.shoes') },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold text-primary-700 dark:text-primary-400 tracking-tight">
          Vête<span className="text-accent-500">Mode</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive
                ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`
            }>{label}</NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <FiSun size={18} className="text-yellow-400" /> : <FiMoon size={18} className="text-gray-600" />}
          </button>

          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('nav.language')}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

          {/* Cart */}
          <Link to="/panier" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-400 hidden sm:block">{user.name.split(' ')[0]}</span>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-down z-50">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {isAdmin() && (
                    <Link to="/admin" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 font-medium">
                      <FiSettings size={14} /> {t('nav.admin_dashboard')}
                    </Link>
                  )}
                  <Link to="/profil" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    <FiUser size={14} /> {t('nav.profile')}
                  </Link>
                  <Link to="/commandes" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    <FiPackage size={14} /> {t('nav.orders')}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border-t border-gray-100 dark:border-gray-700">
                    <FiLogOut size={14} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">{t('nav.login')}</Link>
              <Link to="/register" className="btn-primary  text-sm !py-2 !px-4">{t('nav.register')}</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-4 animate-slide-down">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `block py-3 text-sm font-medium border-b border-gray-50 dark:border-gray-800 ${isActive ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {label}
            </NavLink>
          ))}
          {!user && (
            <div className="flex gap-2 pt-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary  flex-1 text-center text-sm">{t('nav.register')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
