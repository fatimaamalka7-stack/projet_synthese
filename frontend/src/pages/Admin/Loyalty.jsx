import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiShield, FiStar, FiSettings, FiRefreshCw } from 'react-icons/fi'

export default function AdminLoyalty() {
  const [cards, setCards] = useState([])
  const [settings, setSettings] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [cardsRes, settingsRes] = await Promise.all([
        api.get('/admin/loyalty/cards', { params: { page, per_page: 15 } }),
        api.get('/admin/loyalty/settings'),
      ])

      setCards(cardsRes.data.data || [])
      setSettings(settingsRes.data)
    } catch (error) {
      toast.error('Impossible de charger les données fidélité')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await api.put('/admin/loyalty/settings', settings)
      setSettings(res.data.settings)
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Gestion de la fidélité</h1>
        <p className="text-gray-500 text-sm">Suivez les cartes fidélité, modifiez les points et adaptez les règles de fidélisation.</p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <FiSettings size={20} />
              <h2 className="font-semibold">Paramètres fidélité</h2>
            </div>
            {settings ? (
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                {[
                  { label: 'Points par DH', key: 'points_per_currency' },
                  { label: 'Valeur du point (DH)', key: 'point_value' },
                  { label: 'Seuil Silver', key: 'silver_threshold' },
                  { label: 'Seuil Gold', key: 'gold_threshold' },
                  { label: 'Multiplicateur Bronze', key: 'bronze_multiplier' },
                  { label: 'Multiplicateur Silver', key: 'silver_multiplier' },
                  { label: 'Multiplicateur Gold', key: 'gold_multiplier' },
                ].map(({ label, key }) => (
                  <label key={key} className="block">
                    <span className="text-xs text-gray-500">{label}</span>
                    <input
                      type="number"
                      value={settings[key] ?? ''}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="input-field mt-1 w-full"
                    />
                  </label>
                ))}
                <button onClick={saveSettings} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Chargement des paramètres...</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <FiStar size={20} />
              <h2 className="font-semibold">Aperçu des règles</h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>Les clients gagnent des points selon le niveau et dépensent des points pour des réductions.</p>
              <p>Silver à partir de {settings?.silver_threshold ?? '...'} pts.</p>
              <p>Gold à partir de {settings?.gold_threshold ?? '...'} pts.</p>
              <p>1 point vaut {settings ? Number(settings.point_value).toFixed(2) : '...'} DH.</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold">Cartes fidélité</h2>
                <p className="text-sm text-gray-500">{cards.length} cartes affichées</p>
              </div>
              <button onClick={load} className="btn-secondary">
                <FiRefreshCw size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {['Client', 'Points', 'Niveau', 'Total gagné', 'Actions'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {loading ? [...Array(4)].map((_, idx) => (
                    <tr key={idx}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
                  )) : cards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">{card.user?.name} <div className="text-xs text-gray-400">{card.user?.email}</div></td>
                      <td className="px-4 py-3 font-medium">{card.points}</td>
                      <td className="px-4 py-3">{card.level}</td>
                      <td className="px-4 py-3">{card.lifetime_points}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => updateCardPoints(card)} className="btn-secondary min-w-[120px]">
                          <FiShield size={14} className="mr-2" /> Ajuster
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && cards.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-5 text-gray-500 text-center">Aucune carte fidélité trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
