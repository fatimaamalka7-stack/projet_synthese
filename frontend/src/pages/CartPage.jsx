import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'

export default function CartPage() {
  const { t } = useTranslation()
  const { cart, total, itemCount, updateItem, removeItem, clearCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="font-display text-2xl font-bold mb-3">{t('cart.empty_title')}</h2>
      <p className="text-gray-500 mb-6">{t('cart.empty_subtitle')}</p>
      <Link to="/login" className="btn-primary">{t('auth.login_button')}</Link>
    </div>
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  const items = cart?.items || []

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="font-display text-2xl font-bold mb-3">{t('cart.empty_title')}</h2>
      <p className="text-gray-500 mb-6">{t('cart.empty_desc')}</p>
      <Link to="/" className="btn-primary">{t('cart.start_shopping')}</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">{t('cart.title')} ({t('cart.items', { count: itemCount })})</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                {item.product?.image_url
                  ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produits/${item.product_id}`} className="font-semibold hover:text-primary-600 line-clamp-1">{item.product?.name}</Link>
                <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">{Number(item.product?.price).toFixed(2)} DH</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">-</button>
                    <span className="px-3 py-1 font-medium">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1.5">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">{(item.quantity * item.product?.price).toFixed(2)} DH</p>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 mt-2">
            <FiTrash2 size={14} /> {t('cart.clear_cart')}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-24">
          <h3 className="font-display text-xl font-bold mb-4">{t('cart.summary')}</h3>
          <div className="space-y-2 text-sm mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                <span className="truncate mr-2">{item.product?.name} x{item.quantity}</span>
                <span className="shrink-0">{(item.quantity * item.product?.price).toFixed(2)} DH</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-5">
            <div className="flex justify-between font-bold text-lg">
              <span>{t('cart.total')}</span>
              <span className="text-primary-700 dark:text-primary-400">{Number(total).toFixed(2)} DH</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiShoppingBag size={16} /> {t('cart.checkout')} <FiArrowRight size={16} />
          </button>
          <Link to="/" className="btn-secondary w-full text-center mt-3 block">{t('cart.continue_shopping')}</Link>
        </div>
      </div>
    </div>
  )
}
