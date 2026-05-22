import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import i18n from '../i18n'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'vetemode_language'

const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
]

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        if (typeof window === 'undefined') return 'fr'
        return localStorage.getItem(STORAGE_KEY) || 'fr'
    })

    useEffect(() => {
        if (language && i18n.language !== language) {
            i18n.changeLanguage(language)
        }
        localStorage.setItem(STORAGE_KEY, language)
    }, [language])

    const value = useMemo(() => ({ language, setLanguage, languages }), [language])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
