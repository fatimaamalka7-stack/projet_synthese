import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/Products/ProductCard'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiStar, FiArrowLeft, FiPackage } from 'react-icons/fi'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [qty, setQty]           = useState(1)
  const [reviews, setReviews]   = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
    api.get(`/reviews/${id}`)
      .then(r => setReviews(r.data.reviews))
  }, [id])

  const handleAddToCart = () => addToCart(data.product.id, qty)

  const handleReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/reviews', { product_id: id, ...reviewForm })
      toast.success('Avis soumis, en attente de validation')
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl"/>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4"/>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/4"/>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"/>
        </div>
      </div>
    </div>
  )

  if (!data) return null
  const { product, similar } = data

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <Link to={-1} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
        <FiArrowLeft size={16}/> Retour
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">👗</div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs mb-3">
            {product.category?.name}
          </span>
          <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={`text-lg ${i <= Math.round(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} avis)</span>
          </div>

          <p className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-4">
            {Number(product.price).toFixed(2)} DH
          </p>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{product.description}</p>

          <div className="space-y-2 mb-5 text-sm">
            {product.matiere  && <div className="flex gap-2"><span className="font-medium w-20">Matière:</span><span className="text-gray-600 dark:text-gray-400">{product.matiere}</span></div>}
            {product.tailles  && <div className="flex gap-2"><span className="font-medium w-20">Tailles:</span><span className="text-gray-600 dark:text-gray-400">{product.tailles}</span></div>}
            {product.couleurs && <div className="flex gap-2"><span className="font-medium w-20">Couleurs:</span><span className="text-gray-600 dark:text-gray-400">{product.couleurs}</span></div>}
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm">
            <FiPackage size={16} className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}/>
            <span className={product.stock > 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-500'}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold">-</button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1">
                <FiShoppingCart size={16}/> Ajouter au panier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section id="avis" className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-6">Avis clients</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500 mb-6">Aucun avis pour l'instant. Soyez le premier !</p>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600">
                      {r.user?.name?.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">{r.user?.name}</span>
                  </div>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleReview} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Laisser un avis</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Note</label>
              <StarRating value={reviewForm.rating} onChange={v => setReviewForm({...reviewForm, rating: v})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Commentaire</label>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                rows={3} className="input-field resize-none" placeholder="Partagez votre expérience..." required/>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Envoi...' : 'Publier l\'avis'}
            </button>
          </form>
        ) : (
          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-5 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Connectez-vous</Link> pour laisser un avis
            </p>
          </div>
        )}
      </section>

      {/* Similar products */}
      {similar && similar.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
