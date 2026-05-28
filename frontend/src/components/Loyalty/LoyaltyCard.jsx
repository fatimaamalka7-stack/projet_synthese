export default function LoyaltyCard({ card, settings }) {
  if (!card || !settings) {
    return null
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-gray-500">Points fidélité</p>
          <h2 className="text-2xl font-semibold">{card.points} pts</h2>
        </div>
        <div className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
          {settings ? `${Number(settings.point_value).toFixed(2)} DH / point` : '...' }
        </div>
      </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between gap-2">
          <span>Points disponibles</span>
          <span className="font-medium">{card.points}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Réduction possible</span>
          <span className="font-medium">{card.possible_discount.toFixed(2)} DH</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-200">
        1 point = 0,1 DH. 100 points = 10 DH de réduction.
      </div>
    </div>
  )
}
