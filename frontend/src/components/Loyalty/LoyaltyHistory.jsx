export default function LoyaltyHistory({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm text-gray-500">
        Aucune activité fidélité récente.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Historique des points</div>
      <div className="space-y-3 text-sm">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-100">{transaction.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <div className={`text-sm font-semibold ${transaction.points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {transaction.points > 0 ? `+${transaction.points}` : transaction.points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
