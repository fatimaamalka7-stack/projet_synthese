import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/reviews', { params: { page, per_page: 15 } })
      .then(r => { setReviews(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Consultation des avis</h1>
        <p className="text-gray-500 text-sm max-w-2xl">
          Affichez l’ensemble des retours clients en toute simplicité. Aucune action n’est requise ici, uniquement une lecture claire et professionnelle des avis utilisateurs.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-200/70 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Avis utilisateurs</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{meta?.total || 0} avis enregistrés</p>
            </div>
            <div className="text-sm text-gray-500">
              Page {page} / {meta?.last_page || 1}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-white dark:bg-gray-950">
              <tr>
                {['Client', 'Produit', 'Note', 'Commentaire'].map((header) => (
                  <th key={header} className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-5">
                    <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-800 w-3/4 mb-3" />
                    <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-800 w-1/2" />
                  </td>
                </tr>
              )) : reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
                  <td className="px-6 py-5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{review.user?.name}</td>
                  <td className="px-6 py-5 text-gray-500 max-w-xs truncate">{review.product?.name}</td>
                  <td className="px-6 py-5 text-gray-700 dark:text-gray-300">
                    <div className="inline-flex items-center gap-1 font-semibold text-yellow-500">
                      {'★'.repeat(review.rating)}
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 max-w-2xl">
                    <p className="leading-6 line-clamp-3">{review.comment || '—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <span>{reviews.length} avis affichés</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                Précédent
              </button>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
