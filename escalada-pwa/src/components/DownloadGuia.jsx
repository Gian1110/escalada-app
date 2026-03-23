import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

async function precacheUrl(url) {
  try {
    const cache = await caches.open('supabase-data')
    const cached = await cache.match(url)
    if (!cached) await cache.add(url)
  } catch (e) { /* silencioso */ }
}

async function precacheImage(url) {
  if (!url) return
  try {
    const cache = await caches.open('supabase-images')
    const cached = await cache.match(url)
    if (!cached) await cache.add(url)
  } catch (e) { /* silencioso */ }
}

async function downloadTodo(onProgress) {
  const base = import.meta.env.VITE_SUPABASE_URL
  const key  = import.meta.env.VITE_SUPABASE_ANON_KEY
  const headers = { apikey: key, Authorization: `Bearer ${key}` }

  const get = async (path) => {
    const url = `${base}/rest/v1/${path}`
    const res = await fetch(url, { headers })
    // Guardar en cache manualmente también
    try {
      const cache = await caches.open('supabase-data')
      const clone = res.clone()
      await cache.put(url, clone)
    } catch (e) {}
    return res.json()
  }

  onProgress('Descargando provincias...', 5)
  const provincias = await get('provincias?select=*&order=nombre')

  let total = provincias.length
  let done = 0

  for (const prov of provincias) {
    onProgress(`${prov.nombre}...`, 10 + (done / total) * 85)

    // Cachear imagen provincia
    if (prov.imagen) await precacheImage(prov.imagen)

    // Lugares de esta provincia
    const lugares = await get(`lugares?select=*&provincia_id=eq.${prov.id}`)
    for (const lugar of lugares) {
      if (lugar.imagen) await precacheImage(lugar.imagen)

      // Grupos del lugar
      const grupos = await get(`grupos?select=*&lugar_id=eq.${lugar.id}`)
      for (const grupo of grupos) {
        if (grupo.imagen) await precacheImage(grupo.imagen)

        // Vías del grupo
        const vias = await get(`vias?select=*&grupo_id=eq.${grupo.id}`)
        for (const via of vias) {
          if (via.imagen) await precacheImage(via.imagen)
        }
      }
    }
    done++
  }

  onProgress('¡Listo! Guía disponible sin internet', 100)
}

export default function DownloadGuia() {
  const [state, setstate] = useState('idle') // idle | downloading | done | error
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')

  // Solo mostrar si el browser soporta Cache API
  if (typeof caches === 'undefined') return null

  async function handleDownload() {
    setstate('downloading')
    setProgress(0)
    try {
      await downloadTodo((mensaje, pct) => {
        setMsg(mensaje)
        setProgress(Math.round(pct))
      })
      setstate('done')
    } catch (e) {
      console.error(e)
      setstate('error')
      setMsg('Error al descargar. Verificá tu conexión.')
    }
  }

  if (state === 'idle') {
    return (
      <button
        onClick={handleDownload}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--sky-dim)', border: '1px solid var(--sky)',
          color: 'var(--sky-l)', borderRadius: 'var(--r)',
          padding: '10px 16px', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,127,165,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--sky-dim)'}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        Descargar guía para usar sin internet
      </button>
    )
  }

  if (state === 'downloading') {
    return (
      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '12px 16px', minWidth: '260px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--chalk-dim)' }}>{msg}</span>
          <span style={{ color: 'var(--chalk-muted)' }}>{progress}%</span>
        </div>
        <div style={{ height: '4px', background: 'var(--rock-surf)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--sky-l)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green-l)', fontSize: '13px' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Guía descargada — disponible sin internet
        <button onClick={() => setstate('idle')} style={{ background: 'none', border: 'none', color: 'var(--chalk-muted)', fontSize: '11px', cursor: 'pointer', marginLeft: '4px' }}>
          Actualizar
        </button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e06060', fontSize: '13px' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {msg}
        <button onClick={() => setstate('idle')} style={{ background: 'none', border: 'none', color: 'var(--chalk-muted)', fontSize: '11px', cursor: 'pointer', marginLeft: '4px' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return null
}
