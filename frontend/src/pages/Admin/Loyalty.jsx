import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiShield, FiStar, FiRefreshCw } from 'react-icons/fi'

export default function AdminLoyalty() {
  const [cards, setCards] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [adjustForm, setAdjustForm] = useState({ type: 'add_points', points: '', discount_amount: '', comment: '' })

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (search) params.search = search
      if (filter && filter !== 'all') params.filter = filter

      const cardsRes = await api.get('/admin/loyalty/cards', { params })

      setCards(cardsRes.data.data || [])
    } catch (error) {
      toast.error('Impossible de charger les données fidélité')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, filter, search])

  const updateCardPoints = async (card) => {
    const newPoints = Number(prompt('Nouveau nombre de points', card.points))
    if (!Number.isInteger(newPoints) || newPoints < 0) {
      toast.error('Points invalides')
      return
    }

    try {
      const res = await api.put(`/admin/loyalty/cards/${card.id}`, { points: newPoints })
      setCards((current) => current.map((item) => item.id === card.id ? res.data.card : item))
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleAdjust = async () => {
    if (!selectedCard) {
      return
    }

    if (adjustForm.type !== 'special_discount' && (!adjustForm.points || Number(adjustForm.points) <= 0)) {
      toast.error('Veuillez saisir un nombre de points valide')
      return
    }

    if (adjustForm.type === 'special_discount' && (!adjustForm.discount_amount || Number(adjustForm.discount_amount) <= 0)) {
      toast.error('Veuillez saisir un montant de remise valide')
      return
    }

    setSaving(true)
    try {
      const payload = {
        type: adjustForm.type,
        comment: adjustForm.comment,
      }
      if (adjustForm.type === 'special_discount') {
        payload.discount_amount = Number(adjustForm.discount_amount)
      } else {
        payload.points = Number(adjustForm.points)
      }

      const res = await api.post(`/admin/loyalty/cards/${selectedCard.id}/adjust`, payload)
      setSelectedCard(res.data.card)
      setCards((current) => current.map((item) => item.id === selectedCard.id ? res.data.card : item))
      toast.success(res.data.message)
      setAdjustForm({ type: 'add_points', points: '', discount_amount: '', comment: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la gestion fidélité')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Gestion de la fidélité</h1>
        <p className="text-gray-500 text-sm">Suivez les cartes fidélité, modifiez les points et gérez les remises manuelles.</p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <FiStar size={20} />
              <h2 className="font-semibold">Règles de fidélité</h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>1 DH dépensé = 1 point.</p>
              <p>100 points = 10 DH de réduction.</p>
              <p>Les points sont ajoutés automatiquement lors du paiement.</p>
              <p>Aucun bonus ou multiplicateur n’est appliqué.</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="font-semibold">Cartes fidélité</h2>
                <p className="text-sm text-gray-500">{cards.length} cartes affichées</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Rechercher utilisateur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field w-full sm:w-64"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field w-full sm:w-56"
                >
                  <option value="all">Tous les clients</option>
                  <option value="more100">Plus de 100 points</option>
                  <option value="best">Meilleurs clients</option>
                  <option value="few">Peu de points</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {['Client', 'Points', 'Total gagné', 'Actions'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {loading ? [...Array(4)].map((_, idx) => (
                    <tr key={idx}><td colSpan={4} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
                  )) : cards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{card.name || 'Client inconnu'}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[240px]">{card.email || 'Email indisponible'}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">{card.total_points ?? 0}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{card.lifetime_points ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedCard(card)} className="btn-secondary min-w-[120px]">
                          <FiShield size={14} className="mr-2" /> Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && cards.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-5 text-gray-500 text-center">Aucune carte fidélité trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedCard && (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-semibold">Gérer fidélité — {selectedCard.name || 'Client inconnu'}</h2>
                  <p className="text-sm text-gray-500">Points disponibles : {selectedCard.total_points ?? 0} • Total gagné : {selectedCard.lifetime_points ?? 0}</p>
                </div>
                <button onClick={() => setSelectedCard(null)} className="btn-secondary">Fermer</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-gray-500">Type d'action</span>
                  <select
                    className="input-field mt-1 w-full"
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  >
                    <option value="add_points">Ajouter des points</option>
                    <option value="remove_points">Retirer des points</option>
                    <option value="special_discount">Donner une remise spéciale</option>
                  </select>
                </label>

                {adjustForm.type !== 'special_discount' ? (
                  <label className="block">
                    <span className="text-xs text-gray-500">Nombre de points</span>
                    <input
                      type="number"
                      min="0"
                      value={adjustForm.points}
                      onChange={(e) => setAdjustForm({ ...adjustForm, points: e.target.value })}
                      className="input-field mt-1 w-full"
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-xs text-gray-500">Montant de la remise (DH)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={adjustForm.discount_amount}
                      onChange={(e) => setAdjustForm({ ...adjustForm, discount_amount: e.target.value })}
                      className="input-field mt-1 w-full"
                    />
                  </label>
                )}
              </div>

              <label className="block">
                <span className="text-xs text-gray-500">Commentaire / raison</span>
                <textarea
                  rows="3"
                  value={adjustForm.comment}
                  onChange={(e) => setAdjustForm({ ...adjustForm, comment: e.target.value })}
                  className="input-field mt-1 w-full resize-none"
                  placeholder="Ex : remboursement exceptionnel, correction manuelle..."
                />
              </label>

              <button onClick={handleAdjust} disabled={saving} className="btn-primary mt-3">
                {saving ? 'Enregistrement...' : 'Valider l’action fidélité'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
