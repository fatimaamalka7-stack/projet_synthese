import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="font-display text-2xl text-white mb-3">VêteMode</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            {t('footer.description')}
          </p>
          <div className="flex gap-3 mt-4">
            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t('footer.navigation')}</h4>
          <ul className="space-y-2 text-sm">
            {[['nav.home', '/'], ['nav.clothes', '/vetements'], ['nav.shoes', '/chaussures'], ['nav.all_products', '/produits']].map(([key, h]) => (
              <li key={h}><Link to={h} className="hover:text-white transition-colors">{t(key)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t('footer.account')}</h4>
          <ul className="space-y-2 text-sm">
            {[['nav.profile', '/profil'], ['nav.orders', '/commandes'], ['nav.cart', '/panier']].map(([key, h]) => (
              <li key={h}><Link to={h} className="hover:text-white transition-colors">{t(key)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><FiMapPin size={14} className="mt-0.5 shrink-0" /><span>Casablanca, Maroc</span></li>
            <li className="flex gap-2"><FiPhone size={14} className="mt-0.5" /><span>+212 6 00 00 00 00</span></li>
            <li className="flex gap-2"><FiMail size={14} className="mt-0.5" /><span>contact@vetemode.com</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2025 VêteMode. Tous droits réservés.
      </div>
    </footer>
  )
}
