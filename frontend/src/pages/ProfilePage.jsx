import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, login } = useAuth()
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
      toast.error('Les mots de passe ne correspondent pas')
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
      toast.success('Profil mis à jour !')
      setForm(f => ({ ...f, password: '', password_confirmation: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Mon Profil</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {user?.role === 'admin' ? '👑 Administrateur' : '👤 Client'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-3">Informations personnelles</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom complet</label>
            <div className="relative">
              <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={form.name} onChange={set('name')} className="input-field pl-10" placeholder="Votre nom" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={user?.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <div className="relative">
            <FiPhone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={form.phone} onChange={set('phone')} className="input-field pl-10" placeholder="+212 6 00 00 00 00" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Adresse</label>
          <div className="relative">
            <FiMapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <textarea value={form.address} onChange={set('address')} rows={2} className="input-field pl-10 resize-none" placeholder="Votre adresse complète" />
          </div>
        </div>

        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-3 pt-2">Changer le mot de passe</h3>
        <p className="text-xs text-gray-500 -mt-2">Laissez vide pour ne pas changer</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="password" value={form.password} onChange={set('password')} className="input-field pl-10" placeholder="Min. 8 caractères" minLength={8} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirmer</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} className="input-field pl-10" placeholder="Répétez le mot de passe" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave size={16}/>
          {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </form>
    </div>
  )
}
