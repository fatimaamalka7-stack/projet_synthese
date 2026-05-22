import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiArchive, FiTrash2, FiRotateCcw, FiSearch, FiX } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function UserArchives() {
    const [archives, setArchives] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedArchive, setSelectedArchive] = useState(null)
    const [restoring, setRestoring] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadArchives()
    }, [search])

    const loadArchives = async () => {
        setLoading(true)
        try {
            const params = {}
            if (search) params.search = search
            const res = await api.get('/admin/users-archives', { params })
            setArchives(res.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des archives')
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async (archiveId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir restaurer cet utilisateur ?')) return

        setRestoring(true)
        try {
            await api.post(`/admin/users-archives/${archiveId}/restore`)
            toast.success('Utilisateur restauré avec succès')
            loadArchives()
            setSelectedArchive(null)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la restauration')
        } finally {
            setRestoring(false)
        }
    }

    const handleDelete = async (archiveId) => {
        if (!window.confirm('Cette action est définitive. Voulez-vous continuer ?')) return

        setDeleting(true)
        try {
            await api.delete(`/admin/users-archives/${archiveId}`)
            toast.success('Archive supprimée')
            loadArchives()
            setSelectedArchive(null)
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight flex items-center gap-3">
                    <FiArchive className="text-amber-600" size={32} />
                    Utilisateurs archivés
                </h1>
                <p className="text-gray-500 mt-1">Gérez les archives des utilisateurs supprimés</p>
            </div>

            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field w-full pl-10"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Liste des archives */}
                <div className="lg:col-span-2 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Chargement...</div>
                    ) : archives.data?.length > 0 ? (
                        archives.data.map(archive => (
                            <div
                                key={archive.id}
                                onClick={() => setSelectedArchive(archive)}
                                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border cursor-pointer transition ${selectedArchive?.id === archive.id
                                        ? 'border-amber-500 shadow-md'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-amber-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{archive.name}</p>
                                        <p className="text-sm text-gray-500">{archive.email}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            <span>Rôle: {archive.role === 'admin' ? '🛡️ Admin' : '👤 Client'}</span>
                                            <span>•</span>
                                            <span>Archivé {formatDistanceToNow(new Date(archive.archived_at), { locale: fr, addSuffix: true })}</span>
                                        </div>
                                    </div>
                                    {archive.is_blocked && (
                                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                            Bloqué
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">Aucune archive trouvée</div>
                    )}
                </div>

                {/* Détails et actions */}
                {selectedArchive && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sticky top-20 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Détails de l'archive</h3>
                            <button onClick={() => setSelectedArchive(null)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Nom</p>
                                <p className="text-gray-900 dark:text-white font-medium">{selectedArchive.name}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Email</p>
                                <p className="text-gray-900 dark:text-white font-medium break-all">{selectedArchive.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Téléphone</p>
                                <p className="text-gray-900 dark:text-white">{selectedArchive.phone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Rôle</p>
                                <p className="text-gray-900 dark:text-white">{selectedArchive.role}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Raison d'archivage</p>
                                <p className="text-gray-900 dark:text-white">{selectedArchive.reason || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Archivé par</p>
                                <p className="text-gray-900 dark:text-white text-sm">{selectedArchive.archived_by || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400 tracking-wider">Date d'archivage</p>
                                <p className="text-gray-900 dark:text-white text-sm">
                                    {new Date(selectedArchive.archived_at).toLocaleString('fr-FR')}
                                </p>
                            </div>

                            {selectedArchive.metadata && (
                                <>
                                    <div>
                                        <p className="text-xs uppercase text-gray-400 tracking-wider">Commandes</p>
                                        <p className="text-gray-900 dark:text-white">{selectedArchive.metadata.orders_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-400 tracking-wider">Avis</p>
                                        <p className="text-gray-900 dark:text-white">{selectedArchive.metadata.reviews_count}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => handleRestore(selectedArchive.id)}
                                disabled={restoring}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 text-white text-sm font-medium transition"
                            >
                                <FiRotateCcw size={16} />
                                {restoring ? 'Restauration...' : 'Restaurer'}
                            </button>
                            <button
                                onClick={() => handleDelete(selectedArchive.id)}
                                disabled={deleting}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-400 px-4 py-2 text-white text-sm font-medium transition"
                            >
                                <FiTrash2 size={16} />
                                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
