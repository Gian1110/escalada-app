import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import App from './App.jsx'
import { FavoritesProvider } from './lib/favorites.js'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider><App /></FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
