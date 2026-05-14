import { Link } from 'react-router-dom'
import { FiShoppingCart, FiStar, FiMessageCircle } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FiStar key={i} size={12} className={i < Math.round(product.average_rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
  ))

  return (
    <div className="card group">
      <Link to={`/produits/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100/30 flex items-center justify-center">
            <span className="text-4xl">👗</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Rupture de stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/90 text-primary-700 text-xs shadow">
            {product.category?.name}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/produits/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1 mt-1">
          {stars}
          <span className="text-xs text-gray-500 ml-1">({product.reviews?.length || 0})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
            {Number(product.price).toFixed(2)} DH
          </span>
          <div className="flex gap-1">
            <Link to={`/produits/${product.id}#avis`}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <FiMessageCircle size={15} className="text-gray-600 dark:text-gray-300"/>
            </Link>
            <button
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors">
              <FiShoppingCart size={13}/>
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
