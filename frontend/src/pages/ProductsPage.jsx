import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/Products/ProductCard'
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function ProductsPage({ categoryId, title = 'Produits' }) {
  const [products, setProducts]   = useState([])
  const [meta, setMeta]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState('')
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')
  const [page, setPage]           = useState(1)
  const [searchParams]            = useSearchParams()

  useEffect(() => {
    setLoading(true)
    const params = { page, per_page: 12 }
    if (categoryId) params.category_id = categoryId
    if (search)     params.search = search
    if (sort)       params.sort = sort
    if (minPrice)   params.min_price = minPrice
    if (maxPrice)   params.max_price = maxPrice

    api.get('/products', { params })
      .then(r => { setProducts(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }, [categoryId, page, sort, minPrice, maxPrice])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setLoading(true)
    api.get('/products', { params: { search, category_id: categoryId, per_page: 12 } })
      .then(r => { setProducts(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">{title}</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">Chercher</button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
            className="input-field !w-auto">
            <option value="">Trier par</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
          </select>
          <input type="number" placeholder="Prix min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            className="input-field !w-28" />
          <input type="number" placeholder="Prix max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            className="input-field !w-28" />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FiChevronLeft size={18}/>
          </button>
          <span className="text-sm font-medium">Page {page} sur {meta.last_page}</span>
          <button onClick={() => setPage(p => Math.min(meta.last_page, p+1))} disabled={page === meta.last_page}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FiChevronRight size={18}/>
          </button>
        </div>
      )}
    </div>
  )
}
