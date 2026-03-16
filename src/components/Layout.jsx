import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Cerrar menu al navegar
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Bloquear scroll del body cuando el menu esta abierto en mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const NavContent = () => (
    <>
      <div style={{ padding: '1.2rem 1.2rem 1rem', borderBottom: '1px solid var(--rock-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.06em' }}>
            <span style={{ color: 'var(--accent)' }}>Escalada</span>NOA
          </div>
          <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', marginTop: '2px' }}>Guia · Tucuman</div>
        </div>
        {/* Boton cerrar solo en mobile */}
        <button onClick={() => setOpen(false)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--chalk-muted)', cursor: 'pointer', padding: '4px' }} className="close-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      <nav style={{ padding: '0.6rem 0', flex: 1, overflowY: 'auto' }}>
        <SbSection>Publico</SbSection>
        <SbLink to="/"><HomeIcon /> Inicio</SbLink>
        <SbLink to="/rutas"><RoutesIcon /> Ver rutas</SbLink>

        <SbSection style={{ marginTop: '0.4rem' }}>Administracion</SbSection>
        <SbLink to="/admin/nueva"><PlusIcon /> Agregar ruta</SbLink>
        <SbLink to="/admin/gestionar"><ListIcon /> Gestionar rutas</SbLink>
      </nav>

      <div style={{ padding: '0.9rem 1.2rem', borderTop: '1px solid var(--rock-border)', fontSize: '11px', color: 'var(--chalk-muted)' }}>
        {user ? (
          <div>
            <div style={{ marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <NavLink to="/admin/login" style={{ color: 'var(--chalk-muted)' }}>Admin →</NavLink>
        )}
      </div>
    </>
  )

  return (
    <>
      <style>{`
        /* Desktop: sidebar fijo a la izquierda */
        .layout-shell { display: flex; min-height: 100vh; }
        .sidebar-desktop {
          width: var(--sidebar); min-height: 100vh;
          background: var(--rock-mid); border-right: 1px solid var(--rock-border);
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
          flex-shrink: 0; z-index: 50;
        }
        .topbar-mobile { display: none; }
        .sidebar-drawer { display: none; }
        .drawer-overlay { display: none; }
        .close-btn { display: none !important; }

        /* Mobile: topbar + drawer */
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .topbar-mobile {
            display: flex; align-items: center; justify-content: space-between;
            height: 52px; padding: 0 1rem;
            background: var(--rock-mid); border-bottom: 1px solid var(--rock-border);
            position: sticky; top: 0; z-index: 60;
          }
          .topbar-logo {
            font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 0.06em;
          }
          .hamburger-btn {
            background: none; border: none; color: var(--chalk); cursor: pointer;
            padding: 6px; border-radius: var(--r); display: flex; align-items: center;
          }
          .hamburger-btn:hover { background: var(--rock-surf); }

          /* Overlay oscuro */
          .drawer-overlay {
            display: block;
            position: fixed; inset: 0; z-index: 70;
            background: rgba(0,0,0,0.6);
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s;
          }
          .drawer-overlay.open { opacity: 1; pointer-events: auto; }

          /* Drawer desde la izquierda */
          .sidebar-drawer {
            display: flex; flex-direction: column;
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 280px; z-index: 80;
            background: var(--rock-mid); border-right: 1px solid var(--rock-border);
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
          }
          .sidebar-drawer.open { transform: translateX(0); }
          .close-btn { display: flex !important; }
        }
      `}</style>

      <div className="layout-shell">

        {/* Desktop sidebar */}
        <aside className="sidebar-desktop">
          <NavContent />
        </aside>

        {/* Mobile topbar */}
        <div className="topbar-mobile">
          <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Mobile overlay */}
        <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

        {/* Mobile drawer */}
        <aside className={`sidebar-drawer ${open ? 'open' : ''}`}>
          <NavContent />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>

      </div>
    </>
  )
}

function SbSection({ children, style }) {
  return (
    <div style={{ fontSize: '9px', color: 'var(--chalk-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.75rem 1.2rem 0.2rem', ...style }}>
      {children}
    </div>
  )
}

function SbLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '0.55rem 1.2rem', fontSize: '13px',
        color: isActive ? 'var(--accent)' : 'var(--chalk-muted)',
        borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
        background: isActive ? 'var(--accent-dim)' : 'transparent',
        transition: 'all 0.12s', textDecoration: 'none',
      })}
    >
      {children}
    </NavLink>
  )
}

function HomeIcon()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2V6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function RoutesIcon() { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 13L6 4l4 6 3-4 1 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function PlusIcon()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function ListIcon()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
