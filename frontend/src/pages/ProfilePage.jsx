import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useLoyalty } from '../context/LoyaltyContext'
import LoyaltyCard from '../components/Loyalty/LoyaltyCard'
import LoyaltyHistory from '../components/Loyalty/LoyaltyHistory'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const { card, settings } = useLoyalty()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password && form.password !== form.password_confirmation) {
      toast.error(t('auth.password_mismatch'))
      return
    }
    setLoading(true)
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address }
      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }
      await api.put('/user/profile', payload)
      toast.success(t('profile.profile_updated'))
      setForm(f => ({ ...f, password: '', password_confirmation: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.profile_error'))
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">{t('profile.title')}</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {user?.role === 'admin' ? t('profile.role_admin') : t('profile.role_customer')}
          </span>
        </div>
      </div>

      {card && settings && (
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <LoyaltyCard card={card} settings={settings} />
          <LoyaltyHistory transactions={card.transactions} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-3">{t('profile.personal_info')}</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.name')}</label>
            <div className="relative">
              <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.name} onChange={set('name')} className="input-field pl-10" placeholder={t('profile.name')} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.email')}</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={user?.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('profile.phone')}</label>
          <div className="relative">
            <FiPhone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={form.phone} onChange={set('phone')} className="input-field pl-10" placeholder={t('profile.phone')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('profile.address')}</label>
          <div className="relative">
            <FiMapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <textarea value={form.address} onChange={set('address')} rows={2} className="input-field pl-10 resize-none" placeholder={t('profile.address')} />
          </div>
        </div>

        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-3 pt-2">{t('profile.change_password')}</h3>
        <p className="text-xs text-gray-500 -mt-2">{t('profile.leave_blank')}</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={form.password} onChange={set('password')} className="input-field pl-10" placeholder={t('auth.password_min')} minLength={8} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.password_confirmation')}</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} className="input-field pl-10" placeholder={t('auth.password_confirmation_placeholder')} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave size={16} />
          {loading ? t('button.loading') : t('profile.save_changes')}
        </button>
      </form>
    </div>
  )
}
