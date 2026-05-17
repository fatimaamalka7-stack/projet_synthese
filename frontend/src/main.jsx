import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from './context/LanguageContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }
      }} />
    </LanguageProvider>
  </React.StrictMode>,
)
