import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiPackage } from 'react-icons/fi'

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  expediee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  livree: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  retournee: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}
const statusKeys = {
  en_attente: 'orders.status_pending',
  expediee: 'orders.status_processing',
  livree: 'orders.status_delivered',
  annulee: 'orders.status_cancelled',
  retournee: 'orders.status_returned',
}

const requestStatusLabels = {
  pending: 'Demande en attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  refunded: 'Remboursée',
}

export default function OrdersPage() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [returnModal, setReturnModal] = useState(null)
  const [requestReason, setRequestReason] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestingReturn, setRequestingReturn] = useState(false)
  const [returnError, setReturnError] = useState('')

  const loadOrders = () => {
    setLoading(true)
    api.get('/orders')
      .then(r => setOrders(r.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
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
          {orders.map(order => {
            const returnRequests = order.return_requests || order.returnRequests || []
            const referenceDate = new Date(order.delivered_at ?? order.created_at)
            const canCancel = !order.returned_at && order.status !== 'annulee' && (Date.now() - referenceDate.getTime()) <= 24 * 60 * 60 * 1000
            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">{t('orders.order_number')} #{order.id}</p>
                  <p className="text-xs text-gray-500">{new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.created_at))}</p>
                </div>
                <span className={`badge ${statusColors[order.returned_at ? 'retournee' : order.status]}`}>{t(statusKeys[order.returned_at ? 'retournee' : order.status] || `orders.status_${order.status}`)}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.quantity * item.price).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>
              {returnRequests.length > 0 && (
                <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50 p-3 text-sm text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                  <div className="font-medium">{requestStatusLabels[returnRequests[0].status] || returnRequests[0].status}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1"><span className="font-semibold">Motif :</span> {returnRequests[0].reason}</p>
                    {returnRequests[0].description && (
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1"><span className="font-semibold">Description :</span> {returnRequests[0].description}</p>
                    )}
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">{t('checkout.payment_method')}: {order.payment_method}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary-600">{Number(order.total).toFixed(2)} DH</span>
                  {canCancel && returnRequests.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setReturnModal(order)
                        setRequestReason('')
                        setRequestDescription('')
                        setReturnError('')
                      }}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Annuler
                    </button>
                  )}
                  {canCancel && returnRequests.length > 0 && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Demande de retour en cours</span>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
      {returnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold">Demande de retour pour la commande #{returnModal.id}</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Expliquez le motif de votre demande de retour. Notre équipe validera la demande rapidement.</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Motif du retour</label>
                    <input
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      className="w-full input-field"
                      placeholder="Ex : produit abîmé, mauvaise taille, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                    <textarea
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      rows={4}
                      className="w-full input-field resize-none"
                      placeholder="Détaillez le problème ou les raisons du retour"
                    />
                  </div>
                </div>
              {returnError && <p className="text-sm text-red-500">{returnError}</p>}
              <div className="flex justify-end gap-3">
                <button onClick={() => setReturnModal(null)} className="btn-secondary">Annuler</button>
                <button
                  onClick={async () => {
                    if (!requestReason.trim()) {
                      setReturnError('Veuillez indiquer un motif de retour.')
                      return
                    }
                    setRequestingReturn(true)
                    try {
                        await api.post(`/orders/${returnModal.id}/returns`, {
                          reason: requestReason,
                          description: requestDescription,
                        })
                      setReturnModal(null)
                      loadOrders()
                      setReturnError('')
                      toast.success('Demande de retour envoyée')
                    } catch (error) {
                      setReturnError(error?.response?.data?.message || 'Impossible d envoyer la demande de retour.')
                    } finally {
                      setRequestingReturn(false)
                    }
                  }}
                  disabled={requestingReturn}
                  className="btn-primary"
                >
                  {requestingReturn ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
