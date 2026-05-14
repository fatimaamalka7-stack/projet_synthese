import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0

  const fetchCart = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await api.get('/cart')
      setCart(res.data.cart)
      setTotal(res.data.total)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Connectez-vous pour ajouter au panier'); return false }
    try {
      await api.post('/cart/add', { product_id: productId, quantity })
      await fetchCart()
      toast.success('Produit ajouté au panier !')
      return true
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
      return false
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      await api.put(`/cart/update/${itemId}`, { quantity })
      await fetchCart()
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur') }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`)
      await fetchCart()
      toast.success('Produit retiré du panier')
    } catch { }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      await fetchCart()
    } catch { }
  }

  return (
    <CartContext.Provider value={{ cart, total, itemCount, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
