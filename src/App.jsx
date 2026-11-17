import ErrorBoundary from './components/ErrorBoundary.jsx'
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import Explore from './pages/Explore.jsx'
import Home from './pages/Home.jsx'
import Destination from './pages/Destination.jsx'
import ViaPage from './pages/Via.jsx'
const Login = lazy(() => import('./pages/admin/Login.jsx'))
const AdminNuevaVia = lazy(() => import('./pages/admin/NuevaVia.jsx'))
const AdminGestionar = lazy(() => import('./pages/admin/Gestionar.jsx'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem', color: 'var(--chalk-muted)' }}>Cargando...</div>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <ErrorBoundary><Suspense fallback={<div role="status" style={{padding:32}}>Cargando…</div>}><Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rutas" element={<Explore />} />
        <Route path="/guardadas" element={<Explore savedOnly />} />
        <Route path="*" element={<div style={{padding:40}}><h1>Página no encontrada</h1><a href="/">Volver al inicio →</a></div>} />
        <Route path="/provincia/:id" element={<Destination key="provincia" level="provincia" />} />
        <Route path="/lugar/:id" element={<Destination key="lugar" level="lugar" />} />
        <Route path="/grupo/:id" element={<Destination key="grupo" level="grupo" />} />
        <Route path="/via/:id" element={<ViaPage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/nueva" element={<ProtectedRoute><AdminNuevaVia /></ProtectedRoute>} />
        <Route path="/admin/gestionar" element={<ProtectedRoute><AdminGestionar /></ProtectedRoute>} />
      </Route>
    </Routes></Suspense></ErrorBoundary>
  )
}
