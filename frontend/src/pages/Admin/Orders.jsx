import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiEye, FiX, FiBell, FiRotateCw } from 'react-icons/fi'

const statusConfig = {
  en_attente: { label:'En attente', cls:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  expediee:   { label:'Expédiée',   cls:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  livree:     { label:'Livrée',     cls:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  annulee:    { label:'Annulée',    cls:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  retournee:  { label:'Retournée',  cls:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [meta, setMeta]         = useState(null)
  const [page, setPage]         = useState(1)
  const [filter, setFilter]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [detail, setDetail]     = useState(null)

  const load = () => {
    setLoading(true)
    const params = { page, per_page: 15 }
    if (filter) {
      params.status = filter
    }
    api.get('/admin/orders', { params })
      .then(r => { setOrders(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      toast.success('Statut mis à jour')
      load()
      if (detail?.id === id) setDetail(d => ({ ...d, status }))
    } catch { toast.error('Erreur') }
  }

  const returnOrder = async (id) => {
    try {
      await api.put(`/admin/orders/${id}/return`)
      toast.success('Commande retournée et stock restauré')
      load()
      if (detail?.id === id) setDetail(d => ({ ...d, returned_at: new Date().toISOString() }))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de traiter le retour')
    }
  }

  const openDetail = async (order) => {
    setDetail(order)

    if (order.admin_seen_at) return

    try {
      const res = await api.put(`/admin/orders/${order.id}/seen`)
      const seenOrder = res.data.order
      setDetail(seenOrder)
      setOrders(current => current.map(item => item.id === order.id ? seenOrder : item))
      window.dispatchEvent(new Event('orders:seen'))
      window.dispatchEvent(new Event('notifications:changed'))
    } catch {
      toast.error('Impossible de marquer la commande comme vue')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="text-gray-500 text-sm">{meta?.total || 0} commandes au total</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[['','Toutes'], ['en_attente','En attente'], ['expediee','Expédiée'], ['livree','Livrée'], ['annulee','Annulée'], ['retournee','Retournée']].map(([v,l]) => (
          <button key={v} onClick={() => { setFilter(v); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter===v ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['#','Client','Date','Total','Paiement','Vue admin','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"/></td></tr>
              )) : orders.map(order => (
                <tr key={order.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!order.admin_seen_at ? 'bg-red-50/60 dark:bg-red-950/20' : ''}`}>
                  <td className="px-4 py-3 font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                      {!order.admin_seen_at && <span className="w-2 h-2 rounded-full bg-red-500" />}
                      #{order.id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 font-semibold text-primary-600">{Number(order.total).toFixed(2)} DH</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{order.payment_method}</td>
                  <td className="px-4 py-3">
                    {order.admin_seen_at ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Vue</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <FiBell size={12} /> Nouvelle
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.returned_at ? 'retournee' : order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 cursor-pointer ${statusConfig[order.returned_at ? 'retournee' : order.status]?.cls}`}>
                      {Object.entries(statusConfig).map(([v,{label}]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => openDetail(order)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500">
                      <FiEye size={15}/>
                    </button>
                    {order.status === 'livree' && !order.returned_at && (new Date() - new Date(order.delivered_at ?? order.created_at)) <= 24 * 60 * 60 * 1000 && (
                      <button onClick={() => returnOrder(order.id)} className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500" title="Retourner la commande">
                        <FiRotateCw size={15}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page}/{meta.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40">Préc.</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page,p+1))} disabled={page===meta.last_page} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40">Suiv.</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-display text-xl font-bold">Commande #{detail.id}</h2>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><FiX size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Client:</span> <span className="font-medium">{detail.user?.name}</span></div>
                <div><span className="text-gray-500">Paiement:</span> <span className="font-medium capitalize">{detail.payment_method}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Adresse:</span> <span className="font-medium">{detail.address}</span></div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Articles commandés</h4>
                {detail.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span className="font-semibold">{(item.quantity * item.price).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-700 pt-3">
                <span>Total</span>
                <span className="text-primary-600">{Number(detail.total).toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
