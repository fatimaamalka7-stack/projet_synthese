import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiCheck, FiClock } from 'react-icons/fi'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [meta, setMeta]       = useState(null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/reviews', { params: { page, per_page: 15 } })
      .then(r => { setReviews(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleValidate = async (id) => {
    try {
      const res = await api.put(`/admin/reviews/${id}/validate`)
      toast.success('Statut mis à jour')
      setReviews(rs => rs.map(r => r.id === id ? { ...r, is_validated: res.data.review.is_validated } : r))
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return
    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Avis supprimé')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Gestion des avis</h1>
        <p className="text-gray-500 text-sm">{meta?.total || 0} avis au total</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Client','Produit','Note','Commentaire','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? [...Array(5)].map((_,i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"/></td></tr>
              )) : reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{r.product?.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5-r.rating)}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="line-clamp-2 text-gray-600 dark:text-gray-400">{r.comment}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.is_validated ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {r.is_validated ? <><FiCheck size={11} className="inline mr-1"/>Validé</> : <><FiClock size={11} className="inline mr-1"/>En attente</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleValidate(r.id)} title={r.is_validated ? 'Invalider' : 'Valider'}
                        className={`p-2 rounded-lg transition-colors ${r.is_validated ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-500' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'}`}>
                        {r.is_validated ? <FiClock size={15}/> : <FiCheck size={15}/>}
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                        <FiTrash2 size={15}/>
                      </button>
                    </div>
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
    </div>
  )
}
