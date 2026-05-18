import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Request interceptor - attach token and locale
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const language = localStorage.getItem('vetemode_language') || 'fr'
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Locale'] = language
  config.headers['Accept-Language'] = language

  // Let axios/browsers set multipart boundaries automatically for FormData requests.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

// Response interceptor - handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
