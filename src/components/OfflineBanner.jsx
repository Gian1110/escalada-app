import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
      background: 'rgba(176,48,32,0.95)', borderBottom: '1px solid rgba(176,48,32,0.5)',
      padding: '8px 1.25rem',
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '12px', color: '#fff',
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      Sin conexión — mostrando datos guardados
    </div>
  )
}
