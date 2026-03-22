import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('pwa_banner_dismissed')

    if (standalone || dismissed) return

    if (ios) {
      setIsIOS(true)
      setShowIOS(true)
      return
    }

    // Android / Chrome — beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa_banner_dismissed', '1')
    setShow(false)
    setShowIOS(false)
  }

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    else dismiss()
  }

  const bannerStyle = {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
    background: 'var(--rock-mid)', borderTop: '1px solid var(--rock-border)',
    padding: '1rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
  }
  const iconStyle = {
    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
    background: '#1e1e1b', border: '1px solid var(--rock-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  if (show) {
    return (
      <div style={bannerStyle}>
        <div style={iconStyle}>
          <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
            <path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="#d4541a" strokeWidth="3" fill="none" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--chalk)' }}>Instalar Escalada Argentina</div>
          <div style={{ fontSize: '11px', color: 'var(--chalk-muted)', marginTop: '2px' }}>Accedé sin internet, directo desde tu pantalla de inicio</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={install} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 'var(--r)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Instalar
          </button>
          <button onClick={dismiss} style={{ background: 'none', border: '1px solid var(--rock-border)', color: 'var(--chalk-muted)', padding: '8px 12px', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer' }}>
            No gracias
          </button>
        </div>
      </div>
    )
  }

  if (showIOS) {
    return (
      <div style={bannerStyle}>
        <div style={iconStyle}>
          <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
            <path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="#d4541a" strokeWidth="3" fill="none" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--chalk)' }}>Instalá la app</div>
          <div style={{ fontSize: '11px', color: 'var(--chalk-muted)', marginTop: '2px', lineHeight: 1.5 }}>
            Tocá <strong style={{ color: 'var(--chalk-dim)' }}>Compartir</strong> <span style={{ fontSize: '13px' }}>⬆</span> y luego <strong style={{ color: 'var(--chalk-dim)' }}>"Agregar a inicio"</strong>
          </div>
        </div>
        <button onClick={dismiss} style={{ background: 'none', border: '1px solid var(--rock-border)', color: 'var(--chalk-muted)', padding: '8px 12px', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer' }}>
          ×
        </button>
      </div>
    )
  }

  return null
}
