import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSearch, FiTrash2, FiLock, FiUnlock, FiShield } from 'react-icons/fi'

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [meta, setMeta]     = useState(null)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/users', { params: { page, search, per_page: 15 } })
      .then(r => { setUsers(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search])

  const handleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`)
      toast.success(res.data.message)
      load()
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur définitivement ?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Utilisateur supprimé')
      load()
    } catch { toast.error('Erreur') }
  }

  const promoteAdmin = async (id) => {
    if (!confirm('Promouvoir cet utilisateur en administrateur ?')) return
    try {
      await api.put(`/admin/users/${id}`, { role: 'admin' })
      toast.success('Utilisateur promu admin')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Utilisateurs</h1>
        <p className="text-gray-500 text-sm">{meta?.total || 0} utilisateurs enregistrés</p>
      </div>

      <div className="relative max-w-xs">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher par nom ou email…" className="input-field pl-10 text-sm" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Utilisateur','Téléphone','Rôle','Statut','Inscrit le','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? [...Array(5)].map((_,i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"/></td></tr>
              )) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 text-sm shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 Client'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_blocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {u.is_blocked ? '🔒 Bloqué' : '✅ Actif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.role !== 'admin' && (
                        <button onClick={() => promoteAdmin(u.id)} title="Promouvoir admin"
                          className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500 transition-colors">
                          <FiShield size={15}/>
                        </button>
                      )}
                      <button onClick={() => handleBlock(u.id)} title={u.is_blocked ? 'Débloquer' : 'Bloquer'}
                        className={`p-2 rounded-lg transition-colors ${u.is_blocked ? 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500' : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-500'}`}>
                        {u.is_blocked ? <FiUnlock size={15}/> : <FiLock size={15}/>}
                      </button>
                      <button onClick={() => handleDelete(u.id)} title="Supprimer"
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
