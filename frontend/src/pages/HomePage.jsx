import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/Products/ProductCard'
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeart } from 'react-icons/fi'

function HeroBanner({ t }) {
  const backgroundImage = '/api/assets/home-background'

  return (
    <section className="relative overflow-hidden w-full h-screen bg-[#050505] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            filter: 'blur(28px)',
            transform: 'scale(1.08)',
          }}
        />
        <img
          src={backgroundImage}
          alt="VêteMode"
          className="relative z-10 mx-auto h-full max-w-full object-contain object-top"
          style={{
            objectPosition: 'top center',
          }}
        />
      </div>

      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

      <div className="relative z-10 flex items-center justify-center w-full h-screen px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/90 font-medium tracking-widest text-sm uppercase mb-3 drop-shadow-lg">{t('home.new_collection')}</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight drop-shadow-lg">
            {t('home.title')}<br />
            <span className="text-accent-300 drop-shadow-lg">{t('home.title_highlight')}</span>
          </h1>
          <p className="text-white/95 text-lg max-w-xl mx-auto mb-8 drop-shadow-md">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/vetements" className="px-7 py-3.5 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl">
              {t('home.btn_clothes')}
            </Link>
            <Link to="/chaussures" className="px-7 py-3.5 bg-white/15 border border-white/40 text-white font-semibold rounded-2xl hover:bg-white/25 transition-colors backdrop-blur-md">
              {t('home.btn_shoes')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features({ t }) {
  const items = [
    { icon: FiTruck, title: t('home.feature_shipping'), desc: t('home.feature_shipping_desc') },
    { icon: FiShield, title: t('home.feature_secure'), desc: t('home.feature_secure_desc') },
    { icon: FiRefreshCw, title: t('home.feature_returns'), desc: t('home.feature_returns_desc') },
    { icon: FiHeart, title: t('home.feature_quality'), desc: t('home.feature_quality_desc') },
  ]
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="text-center p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Icon size={22} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      ))}
    </div>
  )
}

function ProductSection({ title, categoryId, emoji, linkTo, t }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products', { params: { category_id: categoryId, per_page: 4 } })
      .then(r => setProducts(r.data.data?.slice(0, 4) || []))
      .finally(() => setLoading(false))
  }, [categoryId])

  return (
    <section className="max-w-6xl mx-auto px-4 mb-14">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
        </div>
        <Link to={linkTo} className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium text-sm hover:gap-3 transition-all">
          {t('home.see_all')} <FiArrowRight size={16} />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <div className="text-center mt-6">
        <Link to={linkTo} className="btn-secondary inline-flex items-center gap-2">
          {title === t('nav.clothes') ? t('home.view_all_clothes') : t('home.view_all_shoes')} <FiArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <div>
      <HeroBanner t={t} />
      <Features t={t} />
      <ProductSection title={t('nav.clothes')} categoryId={1} emoji="👗" linkTo="/vetements" t={t} />
      <ProductSection title={t('nav.shoes')} categoryId={2} emoji="👟" linkTo="/chaussures" t={t} />
    </div>
  )
}

