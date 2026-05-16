import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi'

// Composant Field extirpé pour éviter re-mount
const Field = ({ label, icon: Icon, name, type = 'text', placeholder, required = false, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon size={16} />
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`input-field pl-10 ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{Array.isArray(error) ? error[0] : error}</p>}
  </div>
)

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Mémoriser les handlers de changement de champ
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
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: t('auth.password_mismatch') })
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success(t('auth.registration_success'))
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else toast.error(data?.message || 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">{t('auth.register_title')}</h1>
          <p className="text-gray-500">{t('auth.register_subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label={t('auth.name')}
              icon={FiUser}
              name="name"
              placeholder={t('auth.name')}
              required
              value={form.name}
              onChange={handleFieldChange}
              error={errors.name}
            />
            <Field
              label={t('auth.email')}
              icon={FiMail}
              name="email"
              type="email"
              placeholder={t('auth.email')}
              required
              value={form.email}
              onChange={handleFieldChange}
              error={errors.email}
            />
            <Field
              label={t('auth.phone')}
              icon={FiPhone}
              name="phone"
              placeholder={t('auth.phone')}
              value={form.phone}
              onChange={handleFieldChange}
              error={errors.phone}
            />
            <Field
              label={t('auth.address')}
              icon={FiMapPin}
              name="address"
              placeholder={t('auth.address')}
              value={form.address}
              onChange={handleFieldChange}
              error={errors.address}
            />

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleFieldChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder={t('auth.password_min')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onMouseDown={handleTogglePwd}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password_confirmation')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FiLock size={16} />
                </div>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleFieldChange}
                  className={`input-field pl-10 ${errors.password_confirmation ? 'border-red-400' : ''}`}
                  placeholder={t('auth.password_confirmation_placeholder')}
                  required
                  autoComplete="new-password"
                />
              </div>
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.register_loading')}
                </span>
              ) : t('auth.create_account')}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          {t('auth.no_account')} {' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  )
}
