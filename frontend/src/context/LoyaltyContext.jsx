import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import api from '../services/api'

const LoyaltyContext = createContext(null)

export function LoyaltyProvider({ children }) {
  const { user } = useAuth()
  const [card, setCard] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadLoyalty = async () => {
    setLoading(true)
    try {
      const res = await api.get('/loyalty')
      setCard(res.data.card)
      setSettings(res.data.settings)
    } catch (error) {
      setCard(null)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadLoyalty()
    } else {
      setCard(null)
      setSettings(null)
      setLoading(false)
    }
  }, [user])

  return (
    <LoyaltyContext.Provider value={{ card, settings, loading, refreshLoyalty: loadLoyalty }}>
      {children}
    </LoyaltyContext.Provider>
  )
}

export const useLoyalty = () => useContext(LoyaltyContext)
