import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiCreditCard, FiTruck, FiDollarSign } from 'react-icons/fi'

export default function CheckoutPage() {
  const { cart, total, fetchCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress]   = useState(user?.address || '')
  const [method, setMethod]     = useState('livraison')
  const [loading, setLoading]   = useState(false)

  const items = cart?.items || []

  const paymentMethods = [
    { value: 'livraison', label: 'Paiement à la livraison', icon: FiTruck, desc: 'Payez en espèces à la réception' },
    { value: 'carte',     label: 'Carte bancaire',          icon: FiCreditCard, desc: 'Visa, Mastercard, CIH...' },
    { value: 'paypal',    label: 'PayPal',                  icon: FiDollarSign, desc: 'Paiement sécurisé via PayPal' },
  ]

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) { toast.error('Veuillez entrer une adresse de livraison'); return }
    setLoading(true)
    try {
      const res = await api.post('/orders', { payment_method: method, address })
      await fetchCart()
      navigate('/commande-confirmee', { state: { order: res.data.order } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">Finaliser la commande</h1>

      <form onSubmit={handleOrder} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Address */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold mb-4">Adresse de livraison</h3>
            <textarea value={address} onChange={e => setAddress(e.target.value)}
              rows={3} className="input-field resize-none" placeholder="Entrez votre adresse complète..." required/>
          </div>

          {/* Payment method */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold mb-4">Mode de paiement</h3>
            <div className="space-y-3">
              {paymentMethods.map(({ value, label, icon: Icon, desc }) => (
                <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={value} checked={method===value} onChange={() => setMethod(value)} className="sr-only"/>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method===value ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Icon size={18} className={method===value ? 'text-primary-600' : 'text-gray-500'}/>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {method === value && <div className="ml-auto w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-24">
          <h3 className="font-display text-xl font-bold mb-4">Votre commande</h3>
          <div className="space-y-2 mb-4 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{item.product?.name} ×{item.quantity}</span>
                <span className="shrink-0 font-medium">{(item.quantity * item.product?.price).toFixed(2)} DH</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-5">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-700 dark:text-primary-400">{Number(total).toFixed(2)} DH</span>
            </div>
          </div>
          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full">
            {loading ? 'Traitement...' : 'Confirmer la commande'}
          </button>
        </div>
      </form>
    </div>
  )
}
