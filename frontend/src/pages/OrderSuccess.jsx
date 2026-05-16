// OrderSuccess.jsx
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function OrderSuccess() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl">✅</span>
      </div>
      <h1 className="font-display text-3xl font-bold mb-3">{t('order_success.title')}</h1>
      <p className="text-gray-500 mb-5">
        {t('order_success.subtitle')}
      </p>
      {order && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-left mb-6">
          <div className="flex justify-between mb-2"><span className="text-gray-500 text-sm">{t('order_success.order_number')}</span><span className="font-semibold">#{order.id}</span></div>
          <div className="flex justify-between mb-2"><span className="text-gray-500 text-sm">{t('order_success.total')}</span><span className="font-semibold text-primary-600">{Number(order.total).toFixed(2)} DH</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">{t('order_success.payment_method')}</span><span className="font-medium capitalize">{order.payment_method}</span></div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/commandes" className="btn-secondary">{t('order_success.my_orders')}</Link>
        <Link to="/" className="btn-primary">{t('order_success.continue')}</Link>
      </div>
    </div>
  )
}

export default OrderSuccess
