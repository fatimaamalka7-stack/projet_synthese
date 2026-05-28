import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiCreditCard, FiDollarSign, FiLock, FiMail, FiTruck } from 'react-icons/fi'

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCardNumber = (value) =>
  onlyDigits(value)
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()

const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const isValidCardNumber = (value) => {
  const digits = onlyDigits(value)
  return digits.length === 16
}

const isValidExpiry = (value) => {
  const [monthValue, yearValue] = value.split('/')
  if (!monthValue || !yearValue || yearValue.length !== 2) return false

  const month = Number(monthValue)
  const year = Number(`20${yearValue}`)
  if (month < 1 || month > 12) return false

  const now = new Date()
  const expiryDate = new Date(year, month)
  const currentMonth = new Date(now.getFullYear(), now.getMonth())

  return expiryDate > currentMonth
}

function CardPaymentForm({ address, disabled, onSuccess }) {
  const { fetchCart } = useCart()
  const { user } = useAuth()
  const [cardData, setCardData] = useState({
    holder: user?.name || '',
    email: user?.email || '',
    number: '',
    expiry: '',
    cvc: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [processing, setProcessing] = useState(false)

  const errors = useMemo(() => {
    const nextErrors = {}
    if (!cardData.holder.trim()) nextErrors.holder = 'Nom obligatoire'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardData.email)) nextErrors.email = 'Email invalide'
    if (!isValidCardNumber(cardData.number)) nextErrors.number = 'Numéro de carte invalide'
    if (!isValidExpiry(cardData.expiry)) nextErrors.expiry = 'Date invalide'
    if (!/^\d{3,4}$/.test(cardData.cvc)) nextErrors.cvc = 'CVC invalide'
    return nextErrors
  }, [cardData])

  const firstCardError = () => {
    const firstKey = ['holder', 'email', 'number', 'expiry', 'cvc'].find((key) => errors[key])
    return firstKey ? errors[firstKey] : ''
  }

  const updateCardData = (field, value) => {
    setCardData((current) => ({ ...current, [field]: value }))
    if (field === 'email') {
      setVerificationCode('')
      setCodeSent(false)
      setSentToEmail('')
    }
  }

  const sendVerificationCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardData.email)) {
      toast.error('Veuillez entrer un email valide')
      return
    }

    setSendingCode(true)
    try {
      const res = await api.post('/payments/card-verification-code', { email: cardData.email })
      setCodeSent(true)
      setSentToEmail(res.data.email || cardData.email)
      toast.success(`${res.data.message || 'Code envoye par email'} : ${res.data.email || cardData.email}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d envoyer le code')
    } finally {
      setSendingCode(false)
    }
  }

  const handleCardPayment = async (e) => {
    e.preventDefault()

    if (!address.trim()) {
      toast.error('Veuillez entrer une adresse de livraison')
      return
    }

    if (Object.keys(errors).length > 0) {
      toast.error(firstCardError() || 'Veuillez verifier les informations de la carte')
      return
    }

    if (!codeSent) {
      await sendVerificationCode()
      return
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      toast.error('Veuillez entrer le code de verification recu par email')
      return
    }

    setProcessing(true)
    try {
      const res = await api.post('/orders', {
        payment_method: 'carte',
        address,
        payment_email: cardData.email,
        verification_code: verificationCode,
      })
      await fetchCart()
      toast.success('Paiement validé et commande créée')
      onSuccess(res.data.order)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleCardPayment} className="mt-4 rounded-xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-900/40 dark:bg-primary-900/10">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-700 dark:text-primary-300">
        <FiLock size={16} />
        Formulaire de validation carte
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">Nom sur la carte</label>
          <input
            type="text"
            value={cardData.holder}
            onChange={(e) => updateCardData('holder', e.target.value)}
            className={`input-field ${errors.holder ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Ex: Sara El Amrani"
            autoComplete="cc-name"
          />
          {errors.holder && <p className="mt-1 text-xs text-red-500">{errors.holder}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">Email de verification</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              value={cardData.email}
              onChange={(e) => updateCardData('email', e.target.value)}
              className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="client@email.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {codeSent && (
          <div className="sm:col-span-2 rounded-xl border border-green-100 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
            <label className="mb-2 block text-sm font-medium">Code recu par email</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => setVerificationCode(onlyDigits(e.target.value).slice(0, 6))}
                className="input-field flex-1"
                placeholder="123456"
                autoComplete="one-time-code"
              />
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={disabled || sendingCode || processing}
                className="btn-secondary shrink-0"
              >
                {sendingCode ? 'Envoi...' : 'Renvoyer'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Entrez le code recu sur {sentToEmail || cardData.email}. Verifiez aussi Spam, Promotions et Tous les messages.
            </p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">Numéro de carte</label>
          <input
            type="text"
            inputMode="numeric"
            value={cardData.number}
            onChange={(e) => updateCardData('number', formatCardNumber(e.target.value))}
            className={`input-field ${errors.number ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="4242 4242 4242 4242"
            autoComplete="cc-number"
          />
          {errors.number && <p className="mt-1 text-xs text-red-500">{errors.number}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Expiration</label>
          <input
            type="text"
            inputMode="numeric"
            value={cardData.expiry}
            onChange={(e) => updateCardData('expiry', formatExpiry(e.target.value))}
            className={`input-field ${errors.expiry ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="MM/AA"
            autoComplete="cc-exp"
          />
          {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">CVC</label>
          <input
            type="text"
            inputMode="numeric"
            value={cardData.cvc}
            onChange={(e) => updateCardData('cvc', onlyDigits(e.target.value).slice(0, 4))}
            className={`input-field ${errors.cvc ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="123"
            autoComplete="cc-csc"
          />
          {errors.cvc && <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || processing || sendingCode}
        className="btn-primary mt-4 w-full"
      >
        {processing
          ? 'Validation du paiement...'
          : sendingCode
            ? 'Envoi du code...'
            : codeSent
              ? 'Confirmer le paiement'
              : 'Valider les informations et envoyer le code'}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { cart, total, fetchCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(user?.address || '')
  const [method, setMethod] = useState('livraison')
  const [loading, setLoading] = useState(false)

  const items = cart?.items || []
  const finalTotal = total

  const paymentMethods = [
    { value: 'livraison', label: 'Paiement à la livraison', icon: FiTruck, desc: 'Payez en espèces à la réception' },
    { value: 'carte', label: 'Carte bancaire', icon: FiCreditCard, desc: 'Visa, Mastercard, CIH...' },
    { value: 'paypal', label: 'PayPal', icon: FiDollarSign, desc: 'Paiement sécurisé via PayPal' },
  ]

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      toast.error('Veuillez entrer une adresse de livraison')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/orders', {
        payment_method: method,
        address,
      })
      await fetchCart()
      navigate('/commande-confirmee', { state: { order: res.data.order } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">Finaliser la commande</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold mb-4">Adresse de livraison</h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Entrez votre adresse complète..."
              required
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold mb-4">Mode de paiement</h3>
            <div className="space-y-3">
              {paymentMethods.map(({ value, label, icon: Icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    method === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={method === value}
                    onChange={() => setMethod(value)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === value ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Icon size={18} className={method === value ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {method === value && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>

            {method === 'carte' && (
              <CardPaymentForm
                address={address}
                disabled={loading || items.length === 0}
                onSuccess={(order) => navigate('/commande-confirmee', { state: { order } })}
              />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-24">
          <h3 className="font-display text-xl font-bold mb-4">Votre commande</h3>
          <div className="space-y-2 mb-4 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                  {item.product?.name} ×{item.quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {(item.quantity * item.product?.price).toFixed(2)} DH
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-5">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-700 dark:text-primary-400">{Number(finalTotal).toFixed(2)} DH</span>
            </div>
          </div>

          {method === 'carte' ? (
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
              Complétez le formulaire de carte pour valider votre commande.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOrder}
              disabled={loading || items.length === 0}
              className="btn-primary w-full"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
