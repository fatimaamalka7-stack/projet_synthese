import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'
import { FiDownload, FiCalendar, FiTrendingUp, FiShoppingBag, FiUsers, FiPackage, FiBarChart2, FiRefreshCw, FiBell } from 'react-icons/fi'
function StatCard({ title, value, icon: Icon, sub, accent }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent}`}>
                <Icon size={20} className="text-white" />
            </div>
            <p className="mt-4 text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="mt-2 text-xs text-gray-400">{sub}</p>}
        </div>
    )
}

export default function AdminReports() {
    const { t } = useTranslation()
    const [reportType, setReportType] = useState('monthly')
    const [year, setYear] = useState(new Date().getFullYear())
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    const loadReports = async () => {
        setLoading(true)
        try {
            const params = { report_type: reportType }
            if (reportType !== 'custom') params.year = year
            if (reportType === 'custom') {
                params.from = from
                params.to = to
            }
            const res = await api.get('/admin/reports', { params })
            setData(res.data)
        } catch (error) {
            toast.error('Impossible de charger les rapports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadReports() }, [reportType, year, from, to])

    const handlePdf = async () => {
        if (reportType === 'custom' && (!from || !to)) {
            toast.error('Sélectionne une période valide pour générer le PDF.')
            return
        }

        setGenerating(true)
        try {
            const params = { report_type: reportType }
            if (reportType !== 'custom') params.year = year
            if (reportType === 'custom') {
                params.from = from
                params.to = to
            }
            const res = await api.get('/admin/reports/pdf', { params, responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `rapport-financier-${reportType}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la génération du PDF')
        } finally {
            setGenerating(false)
        }
    }

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
    const chartData = data?.monthly?.map(item => ({ name: item.label, revenue: item.revenue, orders: item.orders })) || []
    const returnRateData = data?.return_stats?.return_rate_by_product?.map(item => ({ name: item.name, return_rate: item.return_rate })) || []
    const mostReturned = data?.return_stats?.most_returned_product
    const mostCanceled = data?.return_stats?.most_canceled_product
    const lowestReturnProducts = data?.return_stats?.lowest_return_rate_products || []
    const topRestockedProducts = data?.return_stats?.top_restocked_products || []
    const totalReturns = data?.summary?.total_return_requests ?? 0
    const totalRestocked = data?.summary?.restocked_quantity ?? 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <h1 className="font-display text-3xl font-semibold tracking-tight">Gestion des rapports</h1>
                    <p className="text-gray-500 max-w-2xl">
                        Créez des rapports financiers clairs, professionnels et prêts à télécharger pour analyser les ventes, les commandes et les tendances en un seul clic.
                    </p>
                </div>
                <button onClick={handlePdf}
                    disabled={generating || (reportType === 'custom' && (!from || !to))}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <FiDownload size={18} /> {generating ? 'Téléchargement...' : 'Générer PDF'}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_300px]">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Période du rapport</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {['monthly', 'annual', 'custom'].map((option) => (
                                <button key={option} onClick={() => setReportType(option)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${reportType === option ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'}`}>
                                    {option === 'monthly' ? 'Rapport mensuel' : option === 'annual' ? 'Rapport annuel' : 'Personnalisé'}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 space-y-4">
                            {reportType !== 'custom' && (
                                <div className="grid gap-2">
                                    <label className="text-sm text-gray-500">Année</label>
                                    <select value={year} onChange={e => setYear(Number(e.target.value))}
                                        className="input-field w-full">
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                            {reportType === 'custom' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label className="text-sm text-gray-500">Début</label>
                                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-field w-full" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm text-gray-500">Fin</label>
                                        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-field w-full" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                            <StatCard title="Total des retours" value={totalReturns} icon={FiRefreshCw} accent="bg-purple-600" sub="Demandes enregistrées" />
                            <StatCard title="Article le plus retourné" value={mostReturned?.name ?? 'Aucun'} icon={FiPackage} accent="bg-amber-600" sub={`${mostReturned?.returned_quantity ?? 0} retours`} />
                            <StatCard title="Produit le plus annulé" value={mostCanceled?.name ?? 'Aucun'} icon={FiBell} accent="bg-yellow-500" sub={`${mostCanceled?.canceled_quantity ?? 0} annulations`} />
                            <StatCard title="Articles remis en stock" value={totalRestocked} icon={FiTrendingUp} accent="bg-emerald-600" sub="Quantité restituée" />
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                            <StatCard title="Revenus" value={`${(data?.summary?.total_revenue ?? 0).toFixed(2)} DH`} icon={FiTrendingUp} accent="bg-amber-600" sub="Total sur la période" />
                            <StatCard title="Commandes" value={data?.summary?.total_orders ?? 0} icon={FiShoppingBag} accent="bg-sky-600" sub="Commandes validées" />
                            <StatCard title="Produits vendus" value={data?.summary?.total_products_sold ?? 0} icon={FiPackage} accent="bg-rose-600" sub="Articles vendus" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Retours</p>
                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <span>Total des demandes</span>
                            <strong>{totalReturns}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <span>Articles remis en stock</span>
                            <strong>{totalRestocked}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <span>Article le plus retourné</span>
                            <strong>{mostReturned?.name ?? 'Aucun'}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span>Produit le plus annulé</span>
                            <strong>{mostCanceled?.name ?? 'Aucun'}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Tendance</p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenus & commandes</h2>
                        </div>
                        <span className="text-xs text-gray-500">{data?.monthly?.length || 0} points</span>
                    </div>

                    {loading ? (
                        <div className="h-[320px] rounded-3xl bg-gray-100 dark:bg-gray-900" />
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A16207" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#A16207" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(value) => [`${value} DH`, 'Revenu']} />
                                <Area type="monotone" dataKey="revenue" stroke="#7C4A32" fill="url(#revenueGradient)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center text-gray-400">Aucune donnée disponible</div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Produits</p>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top produits</h3>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {data?.top_products?.length > 0 ? data.top_products.map((product) => (
                                <div key={product.id} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{product.total_sold} vendus</p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600">{Number(product.revenue).toFixed(0)} DH</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">Aucun produit actif sur cette période.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Catégories</p>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top catégories</h3>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {data?.top_categories?.length > 0 ? data.top_categories.map((category) => (
                                <div key={category.id} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{category.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{category.total_sold} vendus</p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600">{Number(category.revenue).toFixed(0)} DH</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">Aucune catégorie analysée.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Taux de retour</p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Retour par article</h2>
                        </div>
                        <span className="text-xs text-gray-500">{returnRateData.length} articles</span>
                    </div>
                    {loading ? (
                        <div className="h-[320px] rounded-3xl bg-gray-100 dark:bg-gray-900" />
                    ) : returnRateData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={returnRateData} margin={{ top: 10, right: 0, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(value) => [`${value}%`, 'Taux']} />
                                <Bar dataKey="return_rate" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center text-gray-400">Aucune donnée de retour disponible</div>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="mb-4">
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Qualité produit</p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faible taux de retour</h3>
                    </div>
                    <div className="space-y-3">
                        {lowestReturnProducts.length > 0 ? lowestReturnProducts.map((item) => (
                            <div key={item.id} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.sold_quantity} vendus</p>
                                    </div>
                                    <span className="text-sm font-semibold text-primary-600">{item.return_rate}%</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">Pas de produit avec des retours enregistrés.</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                        <div className="mb-4">
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Annulations</p>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produit le plus annulé</h3>
                        </div>
                        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4">
                            <p className="font-semibold text-gray-900 dark:text-white">{mostCanceled?.name ?? 'Aucun'}</p>
                            <p className="text-sm text-gray-500 mt-2">{mostCanceled?.canceled_quantity ?? 0} articles annulés</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5">
                        <div className="mb-4">
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Restockage</p>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produits remis en stock</h3>
                        </div>
                        <div className="space-y-3">
                            {topRestockedProducts.length > 0 ? topRestockedProducts.map((product) => (
                                <div key={product.id} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">articles remis en stock</p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600">{product.quantity}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">Aucun produit remis en stock sur cette période.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

            
    )
}
