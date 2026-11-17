import { invalidateCatalog } from '../lib/catalog.js'
import { useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import InstallBanner from './InstallBanner.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import '../styles/discover.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0); if (pathname.startsWith('/admin')) invalidateCatalog() }, [pathname])
  return <div className="site-shell">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Más que Escalada · Inicio"><img src="/icons/logo.jpg" alt="" width="58" height="58"/><span>MÁS QUE<br/><strong>ESCALADA</strong></span></Link>
      <nav aria-label="Navegación principal"><NavLink end to="/">Inicio</NavLink><NavLink to="/rutas">Explorar vías</NavLink><NavLink to="/guardadas">♡ Guardadas</NavLink></nav>
      <a className="instagram-link" href="https://www.instagram.com/masqueescalada/" target="_blank" rel="noopener noreferrer">@masqueescalada ↗</a>
    </header>
    {user && <nav className="admin-strip" aria-label="Administración"><Link to="/admin/nueva">Agregar vía</Link><Link to="/admin/gestionar">Gestionar contenido</Link><button onClick={logout}>Cerrar sesión</button></nav>}
    <main id="contenido" tabIndex="-1"><Outlet /></main>
    <footer className="site-footer"><div><strong>MÁS QUE ESCALADA</strong><p>Roca, comunidad y próximas aventuras.</p></div><a href="https://www.instagram.com/masqueescalada/" target="_blank" rel="noopener noreferrer">Seguinos en Instagram ↗</a><div><Link to="/admin/login">Administración</Link></div></footer>
    <InstallBanner /><OfflineBanner />
  </div>
}
