import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSun, FiMoon, FiSave, FiUser, FiLock, FiMail } from 'react-icons/fi'

export default function AdminSettings() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pwdForm, setPwdForm] = useState({ password: '', password_confirmation: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const handleProfileSave = async e => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.put('/user/profile', { name: profile.name })
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur') } finally { setSavingProfile(false) }
  }

  const handlePasswordSave = async e => {
    e.preventDefault()
    if (pwdForm.password !== pwdForm.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setSavingPwd(true)
    try {
      await api.put('/user/profile', pwdForm)
      toast.success('Mot de passe modifié')
      setPwdForm({ password: '', password_confirmation: '' })
    } catch { toast.error('Erreur') } finally { setSavingPwd(false) }
  }

  const themeColors = [
    { key: 'violet', name: 'Violet (défaut)', cls: 'bg-purple-500' },
    { key: 'blue', name: 'Bleu', cls: 'bg-blue-500' },
    { key: 'pink', name: 'Rose', cls: 'bg-pink-500' },
    { key: 'emerald', name: 'Émeraude', cls: 'bg-emerald-500' },
    { key: 'orange', name: 'Orange', cls: 'bg-orange-500' },
  ]
  const { color, setColor } = useTheme()

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-500 text-sm">Personnalisez votre dashboard</p>
      </div>

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-lg mb-4">Apparence</h2>

        {/* Dark mode */}
        <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            {dark ? <FiMoon size={20} className="text-primary-400" /> : <FiSun size={20} className="text-yellow-500" />}
            <div>
              <p className="font-medium text-sm">Mode {dark ? 'sombre' : 'clair'}</p>
              <p className="text-xs text-gray-500">Basculer entre clair et sombre</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Color theme preview */}
        <div>
          <p className="font-medium text-sm mb-3">Couleur du thème</p>
          <div className="flex gap-3 flex-wrap">
            {themeColors.map(({ key, name, cls }) => (
              <button key={name} title={name} onClick={() => setColor(key)}
                className={`w-9 h-9 rounded-full ${cls} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all hover:ring-gray-400 ${color === key ? 'ring-4 ring-offset-0 ring-white dark:ring-gray-900' : 'ring-transparent'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">* La personnalisation complète des couleurs nécessite une recompilation Tailwind</p>
        </div>
      </section>

      {/* Profile */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><FiUser size={18} />Profil administrateur</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom affiché</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={profile.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié ici</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            <FiSave size={15} /> {savingProfile ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><FiLock size={18} />Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nouveau mot de passe</label>
            <input type="password" value={pwdForm.password} onChange={e => setPwdForm({ ...pwdForm, password: e.target.value })}
              className="input-field" placeholder="Min. 8 caractères" minLength={8} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirmer le mot de passe</label>
            <input type="password" value={pwdForm.password_confirmation} onChange={e => setPwdForm({ ...pwdForm, password_confirmation: e.target.value })}
              className="input-field" placeholder="Répétez le mot de passe" required />
          </div>
          <button type="submit" disabled={savingPwd} className="btn-primary flex items-center gap-2">
            <FiSave size={15} /> {savingPwd ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </form>
      </section>

      {/* App info */}
      <section className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-500">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">VêteMode Admin Panel</p>
        <p>Version 1.0.0 · Laravel 10 + React 18 + Tailwind CSS</p>
        <p className="mt-1">© 2025 VêteMode. Tous droits réservés.</p>
      </section>
    </div>
  )
}
