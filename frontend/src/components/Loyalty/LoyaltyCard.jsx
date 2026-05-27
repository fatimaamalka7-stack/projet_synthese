import { FiStar } from 'react-icons/fi'

export default function LoyaltyCard({ card, settings }) {
  if (!card || !settings) {
    return null
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-gray-500">Carte fidélité</p>
          <h2 className="text-xl font-semibold">{card.level}</h2>
        </div>
        <div className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
          {card.points} pts
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between gap-2">
          <span>Points cumulés</span>
          <span className="font-medium">{card.lifetime_points}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Valeur du point</span>
          <span className="font-medium">{Number(settings.point_value).toFixed(2)} DH</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Réduction possible</span>
          <span className="font-medium">{Number(card.points * settings.point_value).toFixed(2)} DH</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-900 p-4 text-xs text-gray-500 dark:text-gray-400">
        <FiStar className="inline mr-2" /> Niveau actuel : {card.level}. Les points sont calculés à partir du montant avant réduction.
      </div>
    </div>
  )
}
