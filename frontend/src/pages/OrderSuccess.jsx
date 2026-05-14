// OrderSuccess.jsx
import { useLocation, Link } from 'react-router-dom'

export function OrderSuccess() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl">✅</span>
      </div>
      <h1 className="font-display text-3xl font-bold mb-3">Commande confirmée !</h1>
      <p className="text-gray-500 mb-5">
        Merci pour votre commande. Vous recevrez une confirmation prochainement.
      </p>
      {order && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-left mb-6">
          <div className="flex justify-between mb-2"><span className="text-gray-500 text-sm">N° Commande</span><span className="font-semibold">#{order.id}</span></div>
          <div className="flex justify-between mb-2"><span className="text-gray-500 text-sm">Total</span><span className="font-semibold text-primary-600">{Number(order.total).toFixed(2)} DH</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Paiement</span><span className="font-medium capitalize">{order.payment_method}</span></div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/commandes" className="btn-secondary">Mes commandes</Link>
        <Link to="/" className="btn-primary">Continuer</Link>
      </div>
    </div>
  )
}

export default OrderSuccess
