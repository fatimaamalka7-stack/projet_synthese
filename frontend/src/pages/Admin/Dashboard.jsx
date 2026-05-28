import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { FiUsers, FiShoppingBag, FiPackage, FiTrendingUp, FiBell, FiRefreshCw } from 'react-icons/fi'

const COLORS = ['#c026d3', '#f97316', '#3b82f6', '#10b981']

const statusLabels = { en_attente: 'En attente', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' }

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/statistics'),
      api.get('/admin/statistics/revenue'),
      api.get('/admin/statistics/products'),
    ]).then(([s, r, p]) => {
      setStats(s.data)
      setRevenue(r.data)
      setPopular(p.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  const revenueChartData = revenue.map(r => ({
    date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    revenue: Number(r.revenue),
    commandes: r.orders,
  }))

  const pieData = stats?.orders_by_status?.map(s => ({
    name: statusLabels[s.status] || s.status,
    value: s.count,
  })) || []

  

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">{t('admin.dashboard_title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.dashboard_overview')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title={t('admin.users')} value={stats?.total_users} icon={FiUsers} color="bg-primary-600" sub={t('admin.stats_users_sub')} />
        <StatCard title={t('admin.orders')} value={stats?.total_orders} icon={FiShoppingBag} color="bg-accent-500" sub={t('admin.stats_orders_sub')} />
        <StatCard title={t('admin.pending_orders')} value={stats?.pending_orders} icon={FiBell} color="bg-red-500" sub={t('admin.pending_orders_sub')} />
        <StatCard title={t('admin.products')} value={stats?.total_products} icon={FiPackage} color="bg-blue-500" sub={t('admin.stats_products_sub')} />
        <StatCard title={t('admin.revenue')} value={`${Number(stats?.total_revenue || 0).toFixed(0)} DH`} icon={FiTrendingUp} color="bg-emerald-500" sub={t('admin.stats_revenue_sub')} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue line chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">{t('admin.revenue_last_30_days')}</h3>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} DH`, 'Revenus']} />
                <Line type="monotone" dataKey="revenue" stroke="#c026d3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">{t('admin.no_data')}</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">{t('admin.orders_status')}</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">{t('admin.no_data_short')}</div>
          )}
        </div>
      </div>

      {/* Popular products */}
      {popular.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">{t('admin.best_selling_products')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={popular.map(p => ({ name: p.product?.name?.substring(0, 15) + '…', ventes: p.total_sold }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value}`, t('admin.sales')]} />
              <Bar dataKey="ventes" fill="#c026d3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
