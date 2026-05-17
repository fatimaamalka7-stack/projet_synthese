import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { FiPackage } from 'react-icons/fi'

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  expediee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  livree: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
const statusKeys = { en_attente: 'orders.status_pending', expediee: 'orders.status_processing', livree: 'orders.status_delivered', annulee: 'orders.status_cancelled' }

export default function OrdersPage() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">{t('orders.title')}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('orders.no_orders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">{t('orders.order_number')} #{order.id}</p>
                  <p className="text-xs text-gray-500">{new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.created_at))}</p>
                </div>
                <span className={`badge ${statusColors[order.status]}`}>{t(statusKeys[order.status] || `orders.status_${order.status}`)}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.quantity * item.price).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                <span className="text-sm text-gray-500">{t('checkout.payment_method')}: {order.payment_method}</span>
                <span className="font-bold text-primary-600">{Number(order.total).toFixed(2)} DH</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
