import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider }          from './context/CartContext'
import { ThemeProvider }         from './context/ThemeContext'

// Layouts
import MainLayout  from './components/Layout/MainLayout'
import AdminLayout from './components/Layout/AdminLayout'

// Pages
import HomePage        from './pages/HomePage'
import ProductsPage    from './pages/ProductsPage'
import ProductDetail   from './pages/ProductDetail'
import CartPage        from './pages/CartPage'
import CheckoutPage    from './pages/CheckoutPage'
import OrderSuccess    from './pages/OrderSuccess'
import OrdersPage      from './pages/OrdersPage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import ProfilePage     from './pages/ProfilePage'

// Admin Pages
import AdminDashboard  from './pages/Admin/Dashboard'
import AdminProducts   from './pages/Admin/Products'
import AdminOrders     from './pages/Admin/Orders'
import AdminUsers      from './pages/Admin/Users'
import AdminReviews    from './pages/Admin/Reviews'
import AdminSettings   from './pages/Admin/Settings'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Main */}
              <Route element={<MainLayout />}>
                <Route path="/"               element={<HomePage />} />
                <Route path="/vetements"      element={<ProductsPage categoryId={1} title="Vêtements" />} />
                <Route path="/chaussures"     element={<ProductsPage categoryId={2} title="Chaussures" />} />
                <Route path="/produits"       element={<ProductsPage title="Tous les produits" />} />
                <Route path="/produits/:id"   element={<ProductDetail />} />
                <Route path="/panier"         element={<CartPage />} />
                <Route path="/login"          element={<LoginPage />} />
                <Route path="/register"       element={<RegisterPage />} />
                <Route path="/commande-confirmee" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
                <Route path="/commandes"      element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                <Route path="/profil"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/checkout"       element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index                  element={<AdminDashboard />} />
                <Route path="produits"        element={<AdminProducts />} />
                <Route path="commandes"       element={<AdminOrders />} />
                <Route path="utilisateurs"    element={<AdminUsers />} />
                <Route path="avis"            element={<AdminReviews />} />
                <Route path="parametres"      element={<AdminSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
