import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mémoriser les handlers
  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleTogglePwd = useCallback((e) => {
    e.preventDefault()
    setShowPwd(prev => !prev)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(`Bienvenue, ${data.user.name} !`)
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalid_credentials'))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">{t('auth.login_title')}</h1>
          <p className="text-gray-500">{t('auth.login_subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FiMail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFieldChange}
                  className="input-field pl-10"
                  placeholder={t('auth.email')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleFieldChange}
                  className="input-field pl-10 pr-10"
                  placeholder={t('auth.password_placeholder')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onMouseDown={handleTogglePwd}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.login_loading')}
                </span>
              ) : t('auth.login_button')}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">Compte admin demo :</p>
            <p>Email: admin@vetemode.com</p>
            <p>Mot de passe: password</p>
          </div>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          {t('auth.no_account')} {' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">{t('nav.register')}</Link>
        </p>
      </div>
    </div>
  )
}
