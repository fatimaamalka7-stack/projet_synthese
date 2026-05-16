import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonEN from './locales/en/common.json'
import commonFR from './locales/fr/common.json'

const STORAGE_KEY = 'vetemode_language'
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null

const resources = {
    en: { common: commonEN },
    fr: { common: commonFR },
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage || 'fr',
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'en'],
        ns: ['common'],
        defaultNS: 'common',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    })

export default i18n
