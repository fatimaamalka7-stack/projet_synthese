import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]       = useState({ name:'', email:'', phone:'', address:'', password:'', password_confirmation:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => setForm({...form, [k]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas' })
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Compte créé avec succès !')
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else toast.error(data?.message || 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  const Field = ({ label, icon: Icon, name, type='text', placeholder, required=false }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <input name={name} type={type} value={form[name]} onChange={set(name)}
          className={`input-field pl-10 ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
          placeholder={placeholder} required={required} />
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Créer un compte</h1>
          <p className="text-gray-500">Rejoignez la communauté VêteMode</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom complet"  icon={FiUser}   name="name"     placeholder="Votre nom" required />
            <Field label="Email"        icon={FiMail}   name="email"    type="email" placeholder="vous@exemple.com" required />
            <Field label="Téléphone"    icon={FiPhone}  name="phone"    placeholder="+212 6 00 00 00 00" />
            <Field label="Adresse"      icon={FiMapPin} name="address"  placeholder="Votre adresse" />

            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 8 caractères" required minLength={8} />
                <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')}
                  className={`input-field pl-10 ${errors.password_confirmation ? 'border-red-400' : ''}`}
                  placeholder="Répétez le mot de passe" required />
              </div>
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Création...
                </span>
              ) : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
