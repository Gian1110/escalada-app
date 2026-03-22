import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ProvinciaPage from './pages/Provincia.jsx'
import LugarPage from './pages/Lugar.jsx'
import GrupoPage from './pages/Grupo.jsx'
import ViaPage from './pages/Via.jsx'
import Login from './pages/admin/Login.jsx'
import AdminNuevaVia from './pages/admin/NuevaVia.jsx'
import AdminGestionar from './pages/admin/Gestionar.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem', color: 'var(--chalk-muted)' }}>Cargando...</div>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/provincia/:id" element={<ProvinciaPage />} />
        <Route path="/lugar/:id" element={<LugarPage />} />
        <Route path="/grupo/:id" element={<GrupoPage />} />
        <Route path="/via/:id" element={<ViaPage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/nueva" element={<ProtectedRoute><AdminNuevaVia /></ProtectedRoute>} />
        <Route path="/admin/gestionar" element={<ProtectedRoute><AdminGestionar /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
