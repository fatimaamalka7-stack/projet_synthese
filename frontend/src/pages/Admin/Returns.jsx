import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  refunded: 'Remboursée',
}

export default function AdminReturns() {
  const [returns, setReturns] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const loadReturns = () => {
    setLoading(true)
    api.get('/admin/returns', { params: { page, per_page: 15, status: filter } })
      .then(r => {
        setReturns(r.data.data || [])
        setMeta(r.data)
      })
      .catch(() => {
        setReturns([])
        setMeta(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReturns() }, [page, filter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/returns/${id}/status`, { status })
      toast.success('Statut de retour mis à jour')
      loadReturns()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Demandes de retours</h1>
        <p className="text-gray-500 text-sm">{meta?.total || 0} demandes de retour trouvées</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['','Toutes'], ['pending','En attente'], ['approved','Approuvées'], ['rejected','Rejetées'], ['refunded','Remboursées']].map(([value,label]) => (
          <button
            key={value}
            onClick={() => { setFilter(value); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter===value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['#','Client','Commande','Date','Motif','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"/></td></tr>
              )) : returns.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-500">#{item.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.user?.name}</p>
                    <p className="text-xs text-gray-400">{item.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">#{item.order?.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{item.reason}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'approved'].includes(item.status) && (
                        <button
                          onClick={() => updateStatus(item.id, 'refunded')}
                          className="text-xs rounded-xl border border-purple-300 bg-purple-50 text-purple-700 px-3 py-2"
                        >
                          Remettre en stock
                        </button>
                      )}
                      {item.status === 'refunded' && (
                        <span className="text-xs rounded-xl bg-gray-100 text-gray-600 px-3 py-2">Stock restauré</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && returns.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucune demande de retour pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {meta && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page}/{meta.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40">Préc.</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p+1))} disabled={page === meta.last_page} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40">Suiv.</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
